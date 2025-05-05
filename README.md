# Local Git Stats

A Next.js application that provides detailed statistics and visualizations for local Git repositories. The app allows you to analyze commit history, contributor activity, and generate CSV exports of repository statistics.

## Features

- **Repository Selection**: Browse and select local Git repositories
- **Contributor Statistics**: View detailed stats per contributor including:
  - Number of commits
  - Lines added/deleted
  - Files changed
- **Commit Activity Visualization**: Interactive chart showing commit activity over time
- **Filtering Capabilities**:
  - Filter by date range
  - Filter by specific contributor
  - Click on contributor names to filter their activity
- **CSV Export**: Download detailed daily statistics in CSV format

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technical Details

- Built with Next.js 14 and TypeScript
- Uses React for the frontend
- Implements server-side API routes for Git operations
- Features responsive design with dark mode support
- Uses modern web technologies for data visualization

## Project Structure

- `/app`: Next.js app router pages and API routes
- `/components`: Reusable React components
  - `RepositorySelector`: Repository selection interface
  - `ContributorStatsTable`: Tabular display of contributor statistics
  - `CommitActivityChart`: Visualization of commit activity
  - `Filters`: Date and contributor filtering interface
- `/lib`: Utility functions and shared code

## Development

The application is built with modern web development practices and can be extended with additional features. The main entry point is `app/page.tsx`, which handles the core application logic and state management.
