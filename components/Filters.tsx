	'use client';

import React, { useState, useEffect } from 'react';

interface FiltersProps {
  allContributors: string[];
  currentFilters: { startDate?: string; endDate?: string; contributor?: string };
  onFilterChange: (newFilters: { startDate?: string; endDate?: string; contributor?: string }) => void;
}

const Filters: React.FC<FiltersProps> = ({ allContributors, currentFilters, onFilterChange }) => {
  const [startDate, setStartDate] = useState(currentFilters.startDate || '');
  const [endDate, setEndDate] = useState(currentFilters.endDate || '');
  const [selectedContributor, setSelectedContributor] = useState(currentFilters.contributor || '');

  // Update local state if currentFilters prop changes (e.g., on repo change)
  useEffect(() => {
    setStartDate(currentFilters.startDate || '');
    setEndDate(currentFilters.endDate || '');
    setSelectedContributor(currentFilters.contributor || '');
  }, [currentFilters]);

  const handleApplyFilters = () => {
    onFilterChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      contributor: selectedContributor || undefined,
    });
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedContributor('');
    onFilterChange({}); // Apply empty filters
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contributor */}
        <div>
          <label htmlFor="contributor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contributor
          </label>
          <select
            id="contributor"
            value={selectedContributor}
            onChange={(e) => setSelectedContributor(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Contributors</option>
            {allContributors.map((contributor) => (
              <option key={contributor} value={contributor}>
                {contributor}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
          >
            Apply
          </button>
          <button
            onClick={handleClearFilters}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-150 ease-in-out"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;

