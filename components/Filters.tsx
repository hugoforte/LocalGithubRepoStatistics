	'use client';

import React, { useState, useEffect } from 'react';
import { subDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from 'date-fns';

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

  const applyFilters = (newFilters: { startDate?: string; endDate?: string; contributor?: string }) => {
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedContributor('');
    applyFilters({});
  };

  const setLastWeek = () => {
    const today = new Date();
    const lastWeekEnd = startOfWeek(today, { weekStartsOn: 0 }); // Get start of current week (Sunday)
    const lastWeekStart = startOfWeek(subDays(lastWeekEnd, 7), { weekStartsOn: 0 }); // Get start of last week
    
    const startDateFormatted = format(lastWeekStart, 'yyyy-MM-dd');
    const endDateFormatted = format(endOfWeek(lastWeekStart, { weekStartsOn: 0 }), 'yyyy-MM-dd');
    
    setStartDate(startDateFormatted);
    setEndDate(endDateFormatted);
    applyFilters({
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      contributor: selectedContributor || undefined,
    });
  };

  const setLastMonth = () => {
    const today = new Date();
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);
    
    const startDateFormatted = format(lastMonthStart, 'yyyy-MM-dd');
    const endDateFormatted = format(lastMonthEnd, 'yyyy-MM-dd');
    
    setStartDate(startDateFormatted);
    setEndDate(endDateFormatted);
    applyFilters({
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      contributor: selectedContributor || undefined,
    });
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Preset Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Preset Dates
          </label>
          <div className="flex gap-2">
            <button
              onClick={setLastWeek}
              className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 ease-in-out"
            >
              Last Week
            </button>
            <button
              onClick={setLastMonth}
              className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-150 ease-in-out"
            >
              Last Month
            </button>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              applyFilters({
                startDate: e.target.value || undefined,
                endDate: endDate || undefined,
                contributor: selectedContributor || undefined,
              });
            }}
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
            onChange={(e) => {
              setEndDate(e.target.value);
              applyFilters({
                startDate: startDate || undefined,
                endDate: e.target.value || undefined,
                contributor: selectedContributor || undefined,
              });
            }}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contributor and Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
         {/* Contributor */}
        <div>
          <label htmlFor="contributor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contributor
          </label>
          <select
            id="contributor"
            value={selectedContributor}
            onChange={(e) => {
              setSelectedContributor(e.target.value);
              applyFilters({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                contributor: e.target.value || undefined,
              });
            }}
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

        {/* Spacer */}
        <div className="hidden lg:block"></div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClearFilters}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-150 ease-in-out"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;

