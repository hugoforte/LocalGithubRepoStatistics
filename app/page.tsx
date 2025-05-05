	'use client';

import React, { useState, useEffect } from 'react';
import RepositorySelector from '@/components/RepositorySelector';
import ContributorStatsTable from '@/components/ContributorStatsTable';
import CommitActivityChart from '@/components/CommitActivityChart';
import Filters from '@/components/Filters'; // Import Filters component

// Define structure for stats data (matching API response)
interface ContributorStatsData {
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: number; // Updated: Now a number (count)
}

interface RepoStatsData {
  totalCommits: number;
  contributors: Record<string, ContributorStatsData>;
  commitActivity: { date: string; count: number }[];
  allContributors: string[]; // Added for filter dropdown
}

export default function Home() {
  const [selectedRepoPath, setSelectedRepoPath] = useState<string | null>(null);
  const [repoStats, setRepoStats] = useState<RepoStatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  // State for filters, initialized empty
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; contributor?: string }>({});

  const handleRepositorySelected = (path: string) => {
    setSelectedRepoPath(path);
    setRepoStats(null); // Clear previous stats
    setStatsError(null);
    setFilters({}); // Reset filters when new repo is selected
    fetchStats(path, {}); // Fetch initial stats without filters
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Refetch stats when filters change (handled by useEffect)
  };

  const fetchStats = async (repoPath: string, currentFilters: typeof filters) => {
    if (!repoPath) return;

    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send repoPath and current filters to the API
        body: JSON.stringify({ repoPath, filters: currentFilters }),
      });

      const data = await response.json();

      if (response.ok) {
        setRepoStats(data);
      } else {
        setStatsError(data.error || 'Failed to fetch statistics.');
        setRepoStats(null);
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setStatsError(`An unexpected error occurred: ${err.message}`);
      setRepoStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Effect to refetch stats when filters or selectedRepoPath change
  useEffect(() => {
    if (selectedRepoPath) {
      fetchStats(selectedRepoPath, filters);
    }
    // Dependency array includes selectedRepoPath and filters
    // JSON.stringify(filters) can be used if deep comparison is needed, but simple object reference works here if setFilters always creates a new object
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
          {/* Filters Component - Pass necessary props */}
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
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {statsError}</span>
            </div>
          )}
          {repoStats && !isLoadingStats && !statsError && (
            <div className="space-y-8 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Statistics for: <code className='bg-gray-200 dark:bg-gray-700 p-1 rounded text-sm'>{selectedRepoPath}</code></h2>
              <p className="text-gray-700 dark:text-gray-300">Total Commits Analyzed (matching filters): {repoStats.totalCommits}</p>

              {/* Contributor Stats Table */}
              <ContributorStatsTable contributors={repoStats.contributors} />

              {/* Commit Activity Chart */}
              <CommitActivityChart commitActivity={repoStats.commitActivity} />

              {/* TODO: Add Commit Heatmap Component based on spec */}
              {/* <CommitHeatmap commitActivity={repoStats.commitActivity} /> */}
            </div>
          )}
           {/* Show message if repo selected but no stats loaded (e.g., empty repo or error state cleared) */}
           {!repoStats && !isLoadingStats && !statsError && selectedRepoPath && (
                <p className="text-center text-gray-600 dark:text-gray-400 py-4">Select a repository to view statistics.</p>
           )}
        </div>
      )}
    </main>
  );
}

