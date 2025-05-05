import { NextRequest, NextResponse } from 'next/server';
import simpleGit, { SimpleGit, LogResult, DefaultLogFields } from 'simple-git';
import path from 'path';
import fs from 'fs';

// Define structure for contributor stats
interface ContributorStats {
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: Set<string>;
}

// Define structure for overall stats
interface RepoStats {
  totalCommits: number;
  contributors: Record<string, ContributorStats>;
  commitActivity: { date: string; count: number }[];
  // Add more stats as needed based on spec (e.g., language distribution - harder locally)
}

// Helper function to parse git log output for stats
// Note: simple-git's default log format might not include line changes per commit directly.
// We might need `git.show(['--stat', commit.hash])` for each commit, which can be slow.
// Let's start with commit counts and basic info.
async function parseGitLog(git: SimpleGit, options?: { from?: string; to?: string; author?: string }): Promise<RepoStats> {
  const logOptions: any = {
    '--all': null, // Look at all branches
    '--no-merges': null,
    '--numstat': null, // Provides added/deleted lines per file per commit
    '--date': 'iso-strict', // Consistent date format
  };

  if (options?.from) logOptions['--since'] = options.from;
  if (options?.to) logOptions['--until'] = options.to;
  // Filtering by author directly in log might be complex with multiple authors
  // We'll filter after fetching all logs for simplicity in this example

  const log: LogResult<DefaultLogFields & { diff?: { added: number; deleted: number; files: { file: string }[] } }> = await git.log(logOptions);

  const stats: RepoStats = {
    totalCommits: log.total,
    contributors: {},
    commitActivity: [],
  };

  const commitCountsByDate: Record<string, number> = {};

  for (const commit of log.all) {
    // Filter by author if specified
    if (options?.author && commit.author_name !== options.author) {
      continue;
    }

    const author = commit.author_name;
    if (!stats.contributors[author]) {
      stats.contributors[author] = { commits: 0, linesAdded: 0, linesDeleted: 0, filesChanged: new Set() };
    }
    stats.contributors[author].commits++;

    // Process --numstat output (added/deleted lines)
    // The format is: <added>\t<deleted>\t<filepath>
    // Binary files might show '-' instead of numbers.
    if (commit.body) { // Check if body contains the numstat output (simple-git might parse it differently)
        const lines = commit.body.split('\n');
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

    // Aggregate commit activity by date (YYYY-MM-DD)
    const commitDate = commit.date.substring(0, 10);
    commitCountsByDate[commitDate] = (commitCountsByDate[commitDate] || 0) + 1;
  }

  // Convert filesChanged Set to Array for JSON serialization
  Object.values(stats.contributors).forEach(contrib => {
    // @ts-ignore - Convert Set to Array
    contrib.filesChanged = Array.from(contrib.filesChanged);
  });

  // Format commit activity
  stats.commitActivity = Object.entries(commitCountsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

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

    // Apply filters (example: date range, specific contributor)
    const logOptions: { from?: string; to?: string; author?: string } = {};
    if (filters?.startDate) logOptions.from = filters.startDate;
    if (filters?.endDate) logOptions.to = filters.endDate;
    if (filters?.contributor) logOptions.author = filters.contributor;

    const stats = await parseGitLog(git, logOptions);

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error('Error fetching Git statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch Git statistics', details: error.message }, { status: 500 });
  }
}

