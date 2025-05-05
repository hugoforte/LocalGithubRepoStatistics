	'use client';

import React, { useState, useEffect } from 'react';
import RepositorySelector from '@/components/RepositorySelector';
import ContributorStatsTable from '@/components/ContributorStatsTable';
import CommitActivityChart from '@/components/CommitActivityChart';
import Filters from '@/components/Filters';

// Define structure for stats data (matching API response)
interface ContributorStatsData {
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: number;
}

interface RepoStatsData {
  totalCommits: number;
  contributors: Record<string, ContributorStatsData>;
  commitActivity: { date: string; count: number }[];
  allContributors: string[];
}

export default function Home() {
  const [selectedRepoPath, setSelectedRepoPath] = useState<string | null>(null);
  const [repoStats, setRepoStats] = useState<RepoStatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; contributor?: string }>({});
  const [isDownloadingCsv, setIsDownloadingCsv] = useState<boolean>(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  const handleRepositorySelected = (path: string) => {
    setSelectedRepoPath(path);
    setRepoStats(null);
    setStatsError(null);
    setCsvError(null);
    setFilters({});
    fetchStats(path, {});
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleContributorClick = (contributorName: string) => {
    const newFilters = { ...filters, contributor: contributorName };
    setFilters(newFilters);
  };

  const fetchStats = async (repoPath: string, currentFilters: typeof filters) => {
    if (!repoPath) return;

    setIsLoadingStats(true);
    setStatsError(null);
    setCsvError(null);

    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoPath, filters: currentFilters }),
      });

      const data = await response.json();

      if (response.ok) {
        setRepoStats(data);
      } else {
        setStatsError(data.error || 'Failed to fetch statistics.');
        setRepoStats(null);
      }
    } catch (err: unknown) {
      console.error('Error fetching stats:', err);
      setStatsError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setRepoStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleDownloadCsv = async () => {
    if (!selectedRepoPath) return;

    setIsDownloadingCsv(true);
    setCsvError(null);

    try {
      const response = await fetch('/api/csv-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoPath: selectedRepoPath, filters }),
      });

      if (response.ok) {
        const disposition = response.headers.get('Content-Disposition');
        let filename = 'git_stats_export.csv';
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setCsvError(errorData.error || 'Failed to download CSV.');
      }
    } catch (err: unknown) {
      console.error('Error downloading CSV:', err);
      setCsvError(`An unexpected error occurred during CSV download: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsDownloadingCsv(false);
    }
  };

  useEffect(() => {
    if (selectedRepoPath) {
      fetchStats(selectedRepoPath, filters);
    }
  }, [selectedRepoPath, filters]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 sm:p-12 md:p-24 bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-2xl font-bold text-center lg:text-left text-gray-900 dark:text-gray-100">
          Local Git Repository Statistics
        </h1>
      </div>

      <div className="w-full max-w-5xl mb-8">
        <RepositorySelector onRepositorySelected={handleRepositorySelected} />
      </div>

      {selectedRepoPath && (
        <div className="w-full max-w-5xl">
          {repoStats && repoStats.allContributors && (
              <div className="mb-6">
                  <Filters
                      allContributors={repoStats.allContributors}
                      currentFilters={filters}
                      onFilterChange={handleFilterChange}
                  />
              </div>
          )}

          {isLoadingStats && (
            <p className="text-center text-gray-600 dark:text-gray-400 py-4">Loading statistics...</p>
          )}
          {statsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error fetching stats:</strong>
                <span className="block sm:inline"> {statsError}</span>
            </div>
          )}

          {repoStats && !isLoadingStats && !statsError && (
              <div className="mb-6 text-right">
                  <button
                      onClick={handleDownloadCsv}
                      disabled={isDownloadingCsv}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  >
                      {isDownloadingCsv ? 'Downloading...' : 'Download Daily Stats (CSV)'}
                  </button>
                  {csvError && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">CSV Download Error: {csvError}</p>
                  )}
              </div>
          )}

          {repoStats && !isLoadingStats && !statsError && (
            <div className="space-y-8 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Statistics for: <code className='bg-gray-200 dark:bg-gray-700 p-1 rounded text-sm'>{selectedRepoPath}</code></h2>
              <p className="text-gray-700 dark:text-gray-300">Total Commits Analyzed (matching filters): {repoStats.totalCommits}</p>

              <ContributorStatsTable 
                contributors={repoStats.contributors} 
                onContributorClick={handleContributorClick} 
              />
              <CommitActivityChart commitActivity={repoStats.commitActivity} />
            </div>
          )}

           {!repoStats && !isLoadingStats && !statsError && selectedRepoPath && (
                <p className="text-center text-gray-600 dark:text-gray-400 py-4">No statistics loaded. Check filters or repository content.</p>
           )}
        </div>
      )}
    </main>
  );
}

