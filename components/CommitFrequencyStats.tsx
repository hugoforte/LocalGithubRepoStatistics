'use client';

import React from 'react';

interface CommitFrequencyStatsProps {
  commitActivity: { date: string; count: number }[];
}

const CommitFrequencyStats: React.FC<CommitFrequencyStatsProps> = ({ commitActivity }) => {
  if (!commitActivity || commitActivity.length === 0) {
    return null;
  }

  // Calculate frequency statistics
  const frequencyStats = {
    zeroCommits: 0,
    oneToTwoCommits: 0,
    threeToFiveCommits: 0,
    sixPlusCommits: 0
  };

  commitActivity.forEach(day => {
    if (day.count === 0) {
      frequencyStats.zeroCommits++;
    } else if (day.count <= 2) {
      frequencyStats.oneToTwoCommits++;
    } else if (day.count <= 5) {
      frequencyStats.threeToFiveCommits++;
    } else {
      frequencyStats.sixPlusCommits++;
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Commit Frequency Distribution</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{frequencyStats.zeroCommits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">0 commits</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{frequencyStats.oneToTwoCommits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">1-2 commits</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{frequencyStats.threeToFiveCommits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">3-5 commits</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{frequencyStats.sixPlusCommits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">6+ commits</div>
        </div>
      </div>
    </div>
  );
};

export default CommitFrequencyStats; 