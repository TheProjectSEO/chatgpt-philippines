/**
 * Chart Generator Utility
 *
 * Generates Chart.js configurations for various chart types with beautiful defaults,
 * responsive layouts, and accessibility features.
 *
 * @module chartGenerator
 */

import type {
  ChartConfiguration,
  ChartType,
  ChartData as ChartJsData,
  ChartOptions as ChartJsOptions,
} from 'chart.js';

/**
 * Chart generation options
 */
export interface ChartOptions {
  title?: string;
  xLabel?: string;
  yLabel?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animation?: boolean;
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
}

/**
 * Color schemes for charts
 */
const COLOR_SCHEMES = {
  default: [
    '#3b82f6', // blue-500
    '#ef4444', // red-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
  ],
  gradient: [
    'rgba(59, 130, 246, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(249, 115, 22, 0.8)',
  ],
  professional: [
    '#1e40af', // blue-800
    '#991b1b', // red-800
    '#065f46', // green-800
    '#92400e', // amber-800
    '#5b21b6', // violet-800
    '#831843', // pink-800
    '#164e63', // cyan-800
    '#9a3412', // orange-800
  ],
};

/**
 * Get color scheme with fallback
 */
function getColorScheme(colors?: string[]): string[] {
  if (colors && colors.length > 0) {
    return colors;
  }
  return COLOR_SCHEMES.default;
}

/**
 * Generate gradient colors for charts
 */
function generateGradientColors(
  count: number,
  baseColors?: string[]
): string[] {
  const colors = baseColors || COLOR_SCHEMES.gradient;
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
}

/**
 * Create default chart options
 */
function createDefaultOptions(options: ChartOptions): ChartJsOptions {
  const {
    title,
    xLabel,
    yLabel,
    showLegend = true,
    showGrid = true,
    animation = true,
    responsive = true,
    maintainAspectRatio = true,
    aspectRatio = 2,
  } = options;

  return {
    responsive,
    maintainAspectRatio,
    aspectRatio,
    animation: animation ? { duration: 750, easing: 'easeInOutQuart' } : false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      title: {
        display: !!title,
        text: title || '',
        font: {
          size: 16,
          weight: 'bold' as const,
          family: "'Inter', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: !!xLabel,
          text: xLabel || '',
          font: {
            size: 13,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: !!yLabel,
          text: yLabel || '',
          font: {
            size: 13,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: showGrid,
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
        beginAtZero: true,
      },
    },
  };
}

/**
 * Generate bar chart configuration
 *
 * @param data - Array of data objects
 * @param options - Chart customization options
 * @returns Chart.js configuration object
 *
 * @example
 * ```typescript
 * const data = [
 *   { label: 'January', value: 65 },
 *   { label: 'February', value: 59 },
 *   { label: 'March', value: 80 }
 * ];
 * const config = generateBarChart(data, { title: 'Monthly Sales' });
 * ```
 */
export function generateBarChart(
  data: any[],
  options: ChartOptions = {}
): ChartConfiguration {
  const colors = getColorScheme(options.colors);
  const labels = data.map((item) => item.label || item.name || item.x || '');
  const values = data.map((item) => item.value || item.y || item.count || 0);

  const chartData: ChartJsData = {
    labels,
    datasets: [
      {
        label: options.yLabel || 'Values',
        data: values,
        backgroundColor: generateGradientColors(values.length, colors),
        borderColor: colors[0],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return {
    type: 'bar' as ChartType,
    data: chartData,
    options: {
      ...createDefaultOptions(options),
      plugins: {
        ...createDefaultOptions(options).plugins,
        tooltip: {
          ...createDefaultOptions(options).plugins?.tooltip,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value !== null ? value.toLocaleString() : 'N/A'}`;
            },
          },
        },
      },
    },
  };
}

/**
 * Generate line chart configuration
 *
 * @param data - Array of data objects or datasets
 * @param options - Chart customization options
 * @returns Chart.js configuration object
 *
 * @example
 * ```typescript
 * const data = [
 *   { label: 'Jan', value: 30 },
 *   { label: 'Feb', value: 45 },
 *   { label: 'Mar', value: 60 }
 * ];
 * const config = generateLineChart(data, { title: 'Growth Trend' });
 * ```
 */
export function generateLineChart(
  data: any[],
  options: ChartOptions = {}
): ChartConfiguration {
  const colors = getColorScheme(options.colors);

  // Check if data contains multiple datasets
  const isMultiDataset = data.length > 0 && data[0].datasets;

  let chartData: ChartJsData;

  if (isMultiDataset) {
    // Multiple datasets
    chartData = {
      labels: data[0].labels || [],
      datasets: data[0].datasets.map((dataset: any, index: number) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        data: dataset.data || [],
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}33`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      })),
    };
  } else {
    // Single dataset
    const labels = data.map((item) => item.label || item.name || item.x || '');
    const values = data.map((item) => item.value || item.y || item.count || 0);

    chartData = {
      labels,
      datasets: [
        {
          label: options.yLabel || 'Values',
          data: values,
          borderColor: colors[0],
          backgroundColor: `${colors[0]}33`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: colors[0],
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  }

  return {
    type: 'line' as ChartType,
    data: chartData,
    options: createDefaultOptions(options),
  };
}

/**
 * Generate pie chart configuration
 *
 * @param data - Array of data objects
 * @param options - Chart customization options
 * @returns Chart.js configuration object
 *
 * @example
 * ```typescript
 * const data = [
 *   { label: 'Chrome', value: 60 },
 *   { label: 'Firefox', value: 25 },
 *   { label: 'Safari', value: 15 }
 * ];
 * const config = generatePieChart(data, { title: 'Browser Share' });
 * ```
 */
export function generatePieChart(
  data: any[],
  options: ChartOptions = {}
): ChartConfiguration {
  const colors = getColorScheme(options.colors);
  const labels = data.map((item) => item.label || item.name || '');
  const values = data.map((item) => item.value || item.count || 0);

  const chartData: ChartJsData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: generateGradientColors(values.length, colors),
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const baseOptions = createDefaultOptions(options);
  // Remove scales for pie chart
  delete baseOptions.scales;

  return {
    type: 'pie' as ChartType,
    data: chartData,
    options: {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          ...baseOptions.plugins?.tooltip,
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = typeof context.parsed === 'number' ? context.parsed : 0;
              const dataArray = context.dataset.data as number[];
              const total = dataArray.reduce(
                (acc, val) => acc + (typeof val === 'number' ? val : 0),
                0
              );
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    },
  };
}

/**
 * Generate scatter chart configuration
 *
 * @param data - Array of data objects with x and y values
 * @param options - Chart customization options
 * @returns Chart.js configuration object
 *
 * @example
 * ```typescript
 * const data = [
 *   { x: 10, y: 20 },
 *   { x: 15, y: 25 },
 *   { x: 20, y: 30 }
 * ];
 * const config = generateScatterChart(data, { title: 'Correlation' });
 * ```
 */
export function generateScatterChart(
  data: any[],
  options: ChartOptions = {}
): ChartConfiguration {
  const colors = getColorScheme(options.colors);

  // Check if data contains multiple datasets
  const isMultiDataset = data.length > 0 && Array.isArray(data[0]);

  let chartData: ChartJsData;

  if (isMultiDataset) {
    chartData = {
      datasets: data.map((dataset: any, index: number) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        data: dataset.data || dataset,
        backgroundColor: `${colors[index % colors.length]}CC`,
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      })),
    };
  } else {
    const points = data.map((item) => ({
      x: item.x || 0,
      y: item.y || 0,
    }));

    chartData = {
      datasets: [
        {
          label: options.title || 'Data Points',
          data: points,
          backgroundColor: `${colors[0]}CC`,
          borderColor: colors[0],
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }

  return {
    type: 'scatter' as ChartType,
    data: chartData,
    options: createDefaultOptions(options),
  };
}

/**
 * Generate radar chart configuration
 *
 * @param data - Array of data objects
 * @param options - Chart customization options
 * @returns Chart.js configuration object
 *
 * @example
 * ```typescript
 * const data = [
 *   { label: 'Speed', value: 85 },
 *   { label: 'Reliability', value: 90 },
 *   { label: 'Comfort', value: 75 }
 * ];
 * const config = generateRadarChart(data, { title: 'Performance' });
 * ```
 */
export function generateRadarChart(
  data: any[],
  options: ChartOptions = {}
): ChartConfiguration {
  const colors = getColorScheme(options.colors);

  // Check if data contains multiple datasets
  const isMultiDataset = data.length > 0 && data[0].datasets;

  let chartData: ChartJsData;

  if (isMultiDataset) {
    chartData = {
      labels: data[0].labels || [],
      datasets: data[0].datasets.map((dataset: any, index: number) => ({
        label: dataset.label || `Dataset ${index + 1}`,
        data: dataset.data || [],
        backgroundColor: `${colors[index % colors.length]}33`,
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      })),
    };
  } else {
    const labels = data.map((item) => item.label || item.name || '');
    const values = data.map((item) => item.value || item.count || 0);

    chartData = {
      labels,
      datasets: [
        {
          label: options.title || 'Values',
          data: values,
          backgroundColor: `${colors[0]}33`,
          borderColor: colors[0],
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: colors[0],
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  }

  const baseOptions = createDefaultOptions(options);

  return {
    type: 'radar' as ChartType,
    data: chartData,
    options: {
      ...baseOptions,
      scales: {
        r: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            font: {
              size: 11,
            },
          },
          pointLabels: {
            font: {
              size: 12,
              weight: 'bold' as const,
            },
          },
        },
      },
    },
  };
}

/**
 * Auto-detect appropriate chart type based on data structure
 *
 * @param data - Array of data objects
 * @returns Recommended chart type
 *
 * @example
 * ```typescript
 * const data = [{ label: 'A', value: 10 }, { label: 'B', value: 20 }];
 * const chartType = detectChartType(data); // Returns 'bar'
 * ```
 */
export function detectChartType(data: any[]): ChartType {
  if (!data || data.length === 0) {
    return 'bar';
  }

  const firstItem = data[0];

  // Check for scatter plot data (x, y coordinates)
  if ('x' in firstItem && 'y' in firstItem) {
    return 'scatter';
  }

  // Check for time series data
  if ('date' in firstItem || 'time' in firstItem || 'timestamp' in firstItem) {
    return 'line';
  }

  // Check if data is categorical with percentages or parts of a whole
  if (data.length <= 8 && data.every((item) => item.value || item.count)) {
    const total = data.reduce(
      (sum, item) => sum + (item.value || item.count || 0),
      0
    );
    const allPercentages = data.every(
      (item) => (item.value || item.count || 0) < 100
    );
    if (allPercentages && total <= 100) {
      return 'pie';
    }
  }

  // Default to bar chart
  return 'bar';
}

/**
 * Generate chart configuration based on auto-detected type
 *
 * @param data - Array of data objects
 * @param options - Chart customization options
 * @returns Chart.js configuration object
 */
export function generateChart(
  data: any[],
  options: ChartOptions = {}
): ChartConfiguration {
  const chartType = detectChartType(data);

  switch (chartType) {
    case 'line':
      return generateLineChart(data, options);
    case 'pie':
      return generatePieChart(data, options);
    case 'scatter':
      return generateScatterChart(data, options);
    case 'radar':
      return generateRadarChart(data, options);
    case 'bar':
    default:
      return generateBarChart(data, options);
  }
}

/**
 * Export color schemes for external use
 */
export { COLOR_SCHEMES };
