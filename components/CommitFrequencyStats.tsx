'use client';

import React from 'react';

interface CommitFrequencyStatsProps {
  commitActivity: { date: string; count: number }[];
}

const CommitFrequencyStats: React.FC<CommitFrequencyStatsProps> = ({ commitActivity }) => {
  if (!commitActivity || commitActivity.length === 0) {
    return null;
  }

  const isWeekend = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  const calculateStats = () => ({
    zeroCommits: 0,
    oneToTwoCommits: 0,
    threeToFiveCommits: 0,
    sixPlusCommits: 0
  });

  const overallStats = calculateStats();
  const weekdayStats = calculateStats();

  commitActivity.forEach(day => {
    const stats = overallStats;
    if (day.count === 0) {
      stats.zeroCommits++;
    } else if (day.count <= 2) {
      stats.oneToTwoCommits++;
    } else if (day.count <= 5) {
      stats.threeToFiveCommits++;
    } else {
      stats.sixPlusCommits++;
    }

    if (!isWeekend(day.date)) {
      const wStats = weekdayStats;
      if (day.count === 0) {
        wStats.zeroCommits++;
      } else if (day.count <= 2) {
        wStats.oneToTwoCommits++;
      } else if (day.count <= 5) {
        wStats.threeToFiveCommits++;
      } else {
        wStats.sixPlusCommits++;
      }
    }
  });

  const StatBox = ({ title, stats }: { title: string; stats: typeof overallStats }) => (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.zeroCommits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">0 commits</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.oneToTwoCommits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">1-2 commits</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.threeToFiveCommits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">3-5 commits</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sixPlusCommits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">6+ commits</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <StatBox title="Overall Commit Frequency Distribution" stats={overallStats} />
      <StatBox title="Weekday Commit Frequency Distribution" stats={weekdayStats} />
    </div>
  );
};

export default CommitFrequencyStats; 