	'use client';

import React, { useState, useEffect } from 'react';
import RepositorySelector from '@/components/RepositorySelector';
import ContributorStatsTable from '@/components/ContributorStatsTable';
import CommitActivityChart from '@/components/CommitActivityChart';
// Import other components like CommitHeatmap when created

// Define structure for stats data (matching API response)
interface ContributorStatsData {
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: string[]; // Changed from Set in API
}

interface RepoStatsData {
  totalCommits: number;
  contributors: Record<string, ContributorStatsData>;
  commitActivity: { date: string; count: number }[];
}

export default function Home() {
  const [selectedRepoPath, setSelectedRepoPath] = useState<string | null>(null);
  const [repoStats, setRepoStats] = useState<RepoStatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; contributor?: string }>({});

  const handleRepositorySelected = (path: string) => {
    setSelectedRepoPath(path);
    setRepoStats(null); // Clear previous stats
    setStatsError(null);
    // Optionally trigger initial stats fetch here or wait for user action
    fetchStats(path, filters);
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
        body: JSON.stringify({ repoPath, filters: currentFilters }),
      });

      const data = await response.json();

      if (response.ok) {
        setRepoStats(data);
      } else {
        setStatsError(data.error || 'Failed to fetch statistics.');
        setRepoStats(null);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStatsError('An unexpected error occurred while fetching statistics.');
      setRepoStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Effect to refetch stats when filters change
  useEffect(() => {
    if (selectedRepoPath) {
      fetchStats(selectedRepoPath, filters);
    }
  }, [selectedRepoPath, filters]); // Re-run when path or filters change

  // TODO: Add UI elements for filters (date range picker, contributor dropdown)
  // For now, we just fetch all stats initially.

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
          {isLoadingStats && (
            <p className="text-center text-gray-600 dark:text-gray-400">Loading statistics...</p>
          )}
          {statsError && (
            <p className="text-center text-red-600 dark:text-red-400">Error: {statsError}</p>
          )}
          {repoStats && !isLoadingStats && !statsError && (
            <div className="space-y-8 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Statistics for: <code className='bg-gray-200 dark:bg-gray-700 p-1 rounded'>{selectedRepoPath}</code></h2>
              <p className="text-gray-700 dark:text-gray-300">Total Commits Analyzed: {repoStats.totalCommits}</p>
              
              {/* Contributor Stats Table */}
              <ContributorStatsTable contributors={repoStats.contributors} />

              {/* Commit Activity Chart */}
              <CommitActivityChart commitActivity={repoStats.commitActivity} />

              {/* TODO: Add Commit Heatmap Component */}
              {/* <CommitHeatmap commitActivity={repoStats.commitActivity} /> */}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

