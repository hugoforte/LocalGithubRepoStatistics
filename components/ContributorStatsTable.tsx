	'use client';

import React from 'react';

interface ContributorStatsData {
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  filesChanged: string[];
}

interface ContributorStatsTableProps {
  contributors: Record<string, ContributorStatsData>;
}

const ContributorStatsTable: React.FC<ContributorStatsTableProps> = ({ contributors }) => {
  const contributorNames = Object.keys(contributors);

  if (contributorNames.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400">No contributor data available for the selected period or filters.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold p-4 border-b dark:border-gray-700 text-gray-800 dark:text-gray-200">Contributor Statistics</h3>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Contributor
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Commits
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Lines Added
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Lines Deleted
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Net Contribution
            </th>
             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Files Changed
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {contributorNames.sort().map((name) => {
            const stats = contributors[name];
            const netContribution = stats.linesAdded - stats.linesDeleted;
            return (
              <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {stats.commits}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                  +{stats.linesAdded}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                  -{stats.linesDeleted}
                </td>
                 <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${netContribution >= 0 ? 'text-green-700 dark:text-green-500' : 'text-red-700 dark:text-red-500'}`}>
                  {netContribution >= 0 ? '+' : ''}{netContribution}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {stats.filesChanged.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ContributorStatsTable;

