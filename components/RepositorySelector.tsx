'use client';

import React, { useState } from 'react';

interface RepositorySelectorProps {
  onRepositorySelected: (path: string) => void;
}

const RepositorySelector: React.FC<RepositorySelectorProps> = ({ onRepositorySelected }) => {
  const [repoPath, setRepoPath] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleValidate = async () => {
    if (!repoPath) {
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
        body: JSON.stringify({ repoPath }),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        setIsValid(true);
        setError(null);
        onRepositorySelected(data.path); // Pass the validated, resolved path
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

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Select Local Repository</h2>
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
          onClick={handleValidate}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isValidating ? 'Validating...' : 'Select Repository'}
        </button>
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

