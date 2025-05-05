'use client';

import React, { useState, useEffect } from 'react';

interface RepositorySelectorProps {
  onRepositorySelected: (path: string) => void;
}

interface RecentRepo {
  path: string;
  lastUsed: number;
}

const MAX_RECENT_REPOS = 5;
const RECENT_REPOS_KEY = 'git-stats-recent-repos';

const RepositorySelector: React.FC<RepositorySelectorProps> = ({ onRepositorySelected }) => {
  const [repoPath, setRepoPath] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [recentRepos, setRecentRepos] = useState<RecentRepo[]>([]);

  useEffect(() => {
    // Load recent repos from localStorage
    const stored = localStorage.getItem(RECENT_REPOS_KEY);
    if (stored) {
      setRecentRepos(JSON.parse(stored));
    }
  }, []);

  const updateRecentRepos = (path: string) => {
    const now = Date.now();
    const newRepo: RecentRepo = { path, lastUsed: now };
    
    setRecentRepos(prev => {
      // Remove if exists, add new one, sort by lastUsed, limit to MAX_RECENT_REPOS
      const updated = [
        newRepo,
        ...prev.filter(repo => repo.path !== path)
      ].sort((a, b) => b.lastUsed - a.lastUsed)
       .slice(0, MAX_RECENT_REPOS);
      
      localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleValidate = async (pathToValidate?: string) => {
    const path = pathToValidate || repoPath;
    if (!path) {
      setError('Please enter a repository path.');
      setIsValid(false);
      return;
    }
    setIsValidating(true);
    setError(null);
    setIsValid(null);

    try {
      const response = await fetch('/api/validate-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoPath: path }),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        setIsValid(true);
        setError(null);
        const validatedPath = data.path;
        updateRecentRepos(validatedPath);
        onRepositorySelected(validatedPath);
      } else {
        setIsValid(false);
        setError(data.error || 'Failed to validate repository.');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setIsValid(false);
      setError('An unexpected error occurred during validation.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRecentRepoSelect = (path: string) => {
    setRepoPath(path);
    handleValidate(path);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Select Local Repository</h2>
      <div className="flex flex-col gap-4">
        {recentRepos.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Recent Repositories:</label>
            <div className="flex flex-wrap gap-2">
              {recentRepos.map((repo) => (
                <button
                  key={repo.path}
                  onClick={() => handleRecentRepoSelect(repo.path)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-150 ease-in-out"
                >
                  {repo.path}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            placeholder="Enter absolute path to local Git repository"
            className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isValidating}
          />
          <button
            onClick={() => handleValidate()}
            disabled={isValidating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isValidating ? 'Validating...' : 'Select Repository'}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">Error: {error}</p>
      )}
      {isValid === true && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">Repository validated successfully!</p>
      )}
    </div>
  );
};

export default RepositorySelector;

