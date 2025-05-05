import { NextRequest, NextResponse } from 'next/server';
import simpleGit, { SimpleGit, LogResult } from 'simple-git';
import path from 'path';
import fs from 'fs';

// Define structure for contributor stats
interface ContributorStats {
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: Set<string>; // Use Set for uniqueness, convert later
}

// Define structure for overall stats
interface RepoStats {
  totalCommits: number;
  contributors: Record<string, ContributorStats>;
  commitActivity: { date: string; count: number }[];
  allContributors: string[]; // Add list of all contributors for filtering UI
}

// Define the expected structure of a commit log entry with diff stats
// Based on simple-git types and --numstat output
interface CommitLogEntry {
  hash: string;
  date: string;
  message: string;
  refs: string;
  body: string;
  author_name: string;
  author_email: string;
  diff?: {
    added: number;
    deleted: number;
    files: {
      file: string;
      changes: number;
      insertions: number;
      deletions: number;
      binary: boolean;
    }[];
  };
}

// Helper function to parse git log output for stats
async function parseGitLog(git: SimpleGit, options?: { from?: string; to?: string; author?: string }): Promise<RepoStats> {
  const logOptions: Record<string, string | null> = {
    '--all': null,
    '--no-merges': null,
    '--numstat': null,
    '--date': 'iso-strict',
  };

  if (options?.from) logOptions['--since'] = options.from;
  if (options?.to) logOptions['--until'] = options.to;

  const log: LogResult<CommitLogEntry> = await git.log(logOptions) as LogResult<CommitLogEntry>;

  const stats: RepoStats = {
    totalCommits: 0, // Will be calculated after filtering
    contributors: {},
    commitActivity: [],
    allContributors: [],
  };

  const commitCountsByDate: Record<string, number> = {};
  const allContributorsSet = new Set<string>();

  for (const commit of log.all) {
    allContributorsSet.add(commit.author_name); // Collect all contributors before filtering

    // Filter by author if specified
    if (options?.author && commit.author_name !== options.author) {
      continue;
    }

    stats.totalCommits++; // Increment total commits *after* filtering

    const author = commit.author_name;
    if (!stats.contributors[author]) {
      stats.contributors[author] = { commits: 0, linesAdded: 0, linesDeleted: 0, filesChanged: new Set() };
    }
    stats.contributors[author].commits++;

    // Process diff stats directly from the parsed 'diff' property
    // This relies on simple-git correctly parsing --numstat output into commit.diff
    if (commit.diff && commit.diff.files) {
        commit.diff.files.forEach(fileChange => {
            // Check if insertions/deletions are numbers (not binary files)
            if (typeof fileChange.insertions === 'number' && typeof fileChange.deletions === 'number') {
                stats.contributors[author].linesAdded += fileChange.insertions;
                stats.contributors[author].linesDeleted += fileChange.deletions;
                stats.contributors[author].filesChanged.add(fileChange.file);
            }
        });
    } else {
        // Fallback or alternative parsing if commit.diff is not populated as expected
        // This might involve parsing commit.body or using git.show('--stat', commit.hash)
        // For now, we'll log a warning if diff is missing, indicating potential simple-git parsing issue
        // console.warn(`Diff stats not found for commit ${commit.hash}. Parsing commit.body as fallback.`);
        // Fallback parsing from commit.body (less reliable)
        if (commit.body) {
            const lines = commit.body.trim().split('\n');
            lines.forEach(line => {
                const parts = line.split('\t');
                if (parts.length === 3) {
                    const added = parseInt(parts[0], 10);
                    const deleted = parseInt(parts[1], 10);
                    const file = parts[2];
                    if (!isNaN(added) && !isNaN(deleted)) {
                        stats.contributors[author].linesAdded += added;
                        stats.contributors[author].linesDeleted += deleted;
                        stats.contributors[author].filesChanged.add(file);
                    }
                }
            });
        }
    }

    // Aggregate commit activity by date (YYYY-MM-DD)
    const commitDate = commit.date.substring(0, 10);
    commitCountsByDate[commitDate] = (commitCountsByDate[commitDate] || 0) + 1;
  }

  // Convert filesChanged Set to Array length for JSON serialization
  Object.values(stats.contributors).forEach(contrib => {
    // @ts-expect-error - Replace Set with its size
    contrib.filesChanged = contrib.filesChanged.size;
  });

  // Format commit activity
  stats.commitActivity = Object.entries(commitCountsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

  // Add zero records for missing days
  if (stats.commitActivity.length > 0) {
    const startDate = new Date(stats.commitActivity[0].date);
    const endDate = new Date(stats.commitActivity[stats.commitActivity.length - 1].date);
    const allDates = new Set<string>();
    
    // Generate all dates in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.add(d.toISOString().split('T')[0]);
    }
    
    // Add zero records for missing dates
    const completeActivity = Array.from(allDates).map(date => ({
      date,
      count: commitCountsByDate[date] || 0
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    stats.commitActivity = completeActivity;
  }

  // Add sorted list of all unique contributors
  stats.allContributors = Array.from(allContributorsSet).sort();

  return stats;
}

export async function POST(req: NextRequest) {
  try {
    const { repoPath, filters } = await req.json();

    if (!repoPath || typeof repoPath !== 'string') {
      return NextResponse.json({ error: 'Invalid repository path provided' }, { status: 400 });
    }

    // Security check: Ensure path exists and is a directory (basic check)
    const resolvedPath = path.resolve(repoPath);
    if (!fs.existsSync(resolvedPath) || !fs.lstatSync(resolvedPath).isDirectory()) {
      return NextResponse.json({ error: 'Path does not exist or is not a directory' }, { status: 400 });
    }

    const git = simpleGit(resolvedPath);
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return NextResponse.json({ error: 'Not a valid Git repository' }, { status: 400 });
    }

    // Apply filters
    const logOptions: { from?: string; to?: string; author?: string } = {};
    if (filters?.startDate) logOptions.from = filters.startDate;
    if (filters?.endDate) logOptions.to = filters.endDate;
    if (filters?.contributor) logOptions.author = filters.contributor;

    const stats = await parseGitLog(git, logOptions);

    return NextResponse.json(stats);

  } catch (error: unknown) {
    console.error('Error fetching Git statistics:', error);
    let errorMessage = 'Failed to fetch Git statistics';
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        errorMessage = 'Repository path not found or inaccessible.';
      } else if (error.message.includes('Not a git repository')) {
        errorMessage = 'The specified path is not a valid Git repository.';
      }
    }
    return NextResponse.json({ error: errorMessage, details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

