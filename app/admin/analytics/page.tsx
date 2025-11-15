'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChartDisplay from '@/components/data-viz/ChartDisplay';

interface DashboardData {
  summary: {
    totalPageViews: number;
    uniqueVisitors: number;
    totalToolUsage: number;
    totalEvents: number;
  };
  webVitals: Array<{
    metric_name: string;
    avg_value: number;
    p50_value: number;
    p75_value: number;
    p95_value: number;
    good_count: number;
    needs_improvement_count: number;
    poor_count: number;
    total_count: number;
  }>;
  topPages: Array<{
    page_path: string;
    view_count: number;
    unique_visitors: number;
    avg_time_on_page: number;
    avg_scroll_depth: number;
  }>;
  topTools: Array<{
    tool_name: string;
    usage_count: number;
    unique_users: number;
    avg_processing_time: number;
    success_rate: number;
  }>;
  userFunnel: Array<{
    step_name: string;
    user_count: number;
    conversion_rate: number;
  }>;
  dailyData: Array<{
    date: string;
    pageViews: number;
    toolUsage: number;
  }>;
  deviceBreakdown: Array<{
    name: string;
    count: number;
  }>;
  browserBreakdown: Array<{
    name: string;
    count: number;
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/analytics/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-red-800 dark:text-red-200 text-xl font-bold mb-2">Error</h2>
            <p className="text-red-600 dark:text-red-300">{error || 'Failed to load data'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const webVitalsChartData = {
    labels: data.webVitals.map(v => v.metric_name),
    datasets: [
      {
        label: 'Average Value',
        data: data.webVitals.map(v => v.avg_value),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'P95 Value',
        data: data.webVitals.map(v => v.p95_value),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
    ],
  };

  const webVitalsRatingData = {
    labels: data.webVitals.map(v => v.metric_name),
    datasets: [
      {
        label: 'Good',
        data: data.webVitals.map(v => v.good_count),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      },
      {
        label: 'Needs Improvement',
        data: data.webVitals.map(v => v.needs_improvement_count),
        backgroundColor: 'rgba(251, 191, 36, 0.6)',
      },
      {
        label: 'Poor',
        data: data.webVitals.map(v => v.poor_count),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  const dailyDataChart = {
    labels: data.dailyData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Page Views',
        data: data.dailyData.map(d => d.pageViews),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Tool Usage',
        data: data.dailyData.map(d => d.toolUsage),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topPagesChart = {
    labels: data.topPages.map(p => p.page_path.substring(0, 30)),
    datasets: [
      {
        label: 'Page Views',
        data: data.topPages.map(p => p.view_count),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const topToolsChart = {
    labels: data.topTools.map(t => t.tool_name),
    datasets: [
      {
        label: 'Usage Count',
        data: data.topTools.map(t => t.usage_count),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  const deviceBreakdownChart = {
    labels: data.deviceBreakdown.map(d => d.name),
    datasets: [
      {
        data: data.deviceBreakdown.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(251, 191, 36, 0.6)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const browserBreakdownChart = {
    labels: data.browserBreakdown.map(b => b.name),
    datasets: [
      {
        data: data.browserBreakdown.map(b => b.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(251, 191, 36, 0.6)',
          'rgba(139, 92, 246, 0.6)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics Dashboard
          </h1>

          {/* Date Range Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600 dark:text-gray-400">From:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-600 dark:text-gray-400">To:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Page Views"
            value={data.summary.totalPageViews.toLocaleString()}
            icon="👁️"
            color="blue"
          />
          <SummaryCard
            title="Unique Visitors"
            value={data.summary.uniqueVisitors.toLocaleString()}
            icon="👥"
            color="green"
          />
          <SummaryCard
            title="Tool Usage"
            value={data.summary.totalToolUsage.toLocaleString()}
            icon="🛠️"
            color="purple"
          />
          <SummaryCard
            title="Total Events"
            value={data.summary.totalEvents.toLocaleString()}
            icon="⚡"
            color="yellow"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Trends */}
          <div className="lg:col-span-2">
            <ChartDisplay
              type="line"
              data={dailyDataChart}
              title="Daily Activity Trends"
            />
          </div>

          {/* Web Vitals */}
          <ChartDisplay
            type="bar"
            data={webVitalsChartData}
            title="Web Vitals Performance"
          />

          <ChartDisplay
            type="bar"
            data={webVitalsRatingData}
            title="Web Vitals Rating Distribution"
          />

          {/* Top Pages */}
          <ChartDisplay
            type="bar"
            data={topPagesChart}
            title="Top Pages by Views"
          />

          {/* Top Tools */}
          <ChartDisplay
            type="bar"
            data={topToolsChart}
            title="Most Used Tools"
          />

          {/* Device Breakdown */}
          <ChartDisplay
            type="doughnut"
            data={deviceBreakdownChart}
            title="Device Breakdown"
          />

          {/* Browser Breakdown */}
          <ChartDisplay
            type="pie"
            data={browserBreakdownChart}
            title="Browser Distribution"
          />
        </div>

        {/* Tables */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages Table */}
          <DataTable
            title="Top Pages Details"
            headers={['Page', 'Views', 'Unique', 'Avg Time', 'Scroll %']}
            rows={data.topPages.map(p => [
              p.page_path,
              p.view_count.toString(),
              p.unique_visitors.toString(),
              `${Math.round(p.avg_time_on_page)}s`,
              `${Math.round(p.avg_scroll_depth)}%`,
            ])}
          />

          {/* Top Tools Table */}
          <DataTable
            title="Tool Performance"
            headers={['Tool', 'Uses', 'Users', 'Avg Time', 'Success %']}
            rows={data.topTools.map(t => [
              t.tool_name,
              t.usage_count.toString(),
              t.unique_users.toString(),
              `${Math.round(t.avg_processing_time)}ms`,
              `${t.success_rate.toFixed(1)}%`,
            ])}
          />
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg p-6 text-white`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </motion.div>
  );
}

// Data Table Component
function DataTable({ title, headers, rows }: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className="py-3 px-2 text-gray-600 dark:text-gray-400"
                  >
                    {j === 0 ? (
                      <span className="font-medium text-gray-900 dark:text-white truncate block max-w-[200px]">
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
