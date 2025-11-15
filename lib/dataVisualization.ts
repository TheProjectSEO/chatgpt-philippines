/**
 * Data Visualization Agent - Main Export
 *
 * Comprehensive data visualization toolkit for the ChatGPT Philippines platform.
 * Provides chart generation, data parsing, and export capabilities.
 *
 * @module dataVisualization
 *
 * @example
 * ```typescript
 * import {
 *   parseCSV,
 *   generateBarChart,
 *   exportChatToPDF,
 *   exportChatToPPT,
 * } from '@/lib/dataVisualization';
 *
 * // Parse data file
 * const dataTable = await parseCSV(file);
 *
 * // Generate chart
 * const chartConfig = generateBarChart(dataTable.rows, {
 *   title: 'Sales by Month',
 *   xLabel: 'Month',
 *   yLabel: 'Revenue ($)',
 * });
 *
 * // Export to PDF
 * await exportChatToPDF(messages, charts, 'report');
 * ```
 */

// ============================================================================
// CHART GENERATION
// ============================================================================

export {
  generateBarChart,
  generateLineChart,
  generatePieChart,
  generateScatterChart,
  generateRadarChart,
  generateChart,
  detectChartType,
  COLOR_SCHEMES,
} from './chartGenerator';

export type { ChartOptions } from './chartGenerator';

// ============================================================================
// DATA PARSING
// ============================================================================

export {
  parseCSV,
  parseJSON,
  parseExcel,
  parseFile,
  detectDataTypes,
  generateSummaryStats,
  dataTableToObjects,
  filterRows,
  sortByColumn,
} from './dataParser';

export type {
  DataTable,
  ColumnType,
  ColumnTypes,
  ColumnStats,
  Stats,
} from './dataParser';

// ============================================================================
// PDF EXPORT
// ============================================================================

export {
  exportChatToPDF,
  exportTableToPDF,
  exportSummaryReport,
} from './exportPDF';

export type {
  ChatMessage as PDFChatMessage,
  ChartData as PDFChartData,
  PDFExportOptions,
} from './exportPDF';

// ============================================================================
// POWERPOINT EXPORT
// ============================================================================

export {
  exportChatToPPT,
  exportChartToPPT,
  exportChartsToPPT,
  createCustomPresentation,
  THEMES as PPT_THEMES,
} from './exportPPT';

export type {
  ChatMessage as PPTChatMessage,
  ChartData as PPTChartData,
  PPTExportOptions,
} from './exportPPT';

// ============================================================================
// COMPREHENSIVE TYPES
// ============================================================================

export type {
  // Data structures
  DataTable as DVDataTable,
  ColumnType as DVColumnType,
  ColumnTypes as DVColumnTypes,
  ColumnStats as DVColumnStats,
  Stats as DVStats,

  // Chart configuration
  ChartOptions as DVChartOptions,
  ChartData as DVChartData,

  // Chat & messages
  ChatMessage as DVChatMessage,
  Conversation as DVConversation,

  // Export options
  PDFExportOptions as DVPDFExportOptions,
  PPTExportOptions as DVPPTExportOptions,

  // Analysis & insights
  AnalysisRequest,
  AnalysisResult,
  InsightOptions,
  Insight,

  // Utility types
  DataFileType,
  SortDirection,
  FilterOperator,
  DataFilter,
  DataTransformation,
  AggregateFunction,
  AggregateConfig,

  // API response types
  ApiResponse,
  ChartGenerationResponse,
  DataUploadResponse,

  // Validation types
  ValidationResult,
  ValidationError,
  ValidationWarning,

  // Type guards
  DeepPartial,
  DeepRequired,
  KeysOfType,
  OmitByValueType,
  PickByValueType,

  // Re-exports
  ChartConfiguration,
  ChartType,
} from './dataVisualization.types';

export {
  isDataTable,
  isChartData,
  isChatMessage,
} from './dataVisualization.types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a complete data visualization workflow
 *
 * @param file - Data file to process
 * @param chartType - Type of chart to generate
 * @param options - Chart options
 * @returns Complete workflow result
 *
 * @example
 * ```typescript
 * const result = await createVisualizationWorkflow(file, 'bar', {
 *   title: 'Sales Analysis',
 * });
 *
 * console.log(result.dataTable);
 * console.log(result.stats);
 * console.log(result.chart);
 * ```
 */
export async function createVisualizationWorkflow(
  file: File,
  chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'radar',
  options: import('./chartGenerator').ChartOptions = {}
) {
  const { parseFile, generateSummaryStats, detectDataTypes } = await import('./dataParser');
  const {
    generateBarChart,
    generateLineChart,
    generatePieChart,
    generateScatterChart,
    generateRadarChart,
    detectChartType,
  } = await import('./chartGenerator');

  // Parse the file
  const dataTable = await parseFile(file);

  // Generate statistics
  const stats = generateSummaryStats(dataTable);
  const columnTypes = detectDataTypes(dataTable);

  // Convert to chart data format
  const chartData = dataTable.rows.map((row, index) => ({
    label: row[0],
    value: Number(row[1]) || 0,
  }));

  // Determine chart type
  const finalChartType = chartType || detectChartType(chartData);

  // Generate chart
  let chart;
  switch (finalChartType) {
    case 'line':
      chart = generateLineChart(chartData, options);
      break;
    case 'pie':
      chart = generatePieChart(chartData, options);
      break;
    case 'scatter':
      chart = generateScatterChart(chartData, options);
      break;
    case 'radar':
      chart = generateRadarChart(chartData, options);
      break;
    case 'bar':
    default:
      chart = generateBarChart(chartData, options);
  }

  return {
    dataTable,
    stats,
    columnTypes,
    chart,
    chartType: finalChartType,
  };
}

/**
 * Quick export: Generate chart and export to PDF in one step
 *
 * @param file - Data file
 * @param filename - Output filename
 * @param options - Combined options
 *
 * @example
 * ```typescript
 * await quickExportToPDF(file, 'sales-report', {
 *   chartTitle: 'Q4 Sales',
 *   pdfTitle: 'Sales Analysis Report',
 * });
 * ```
 */
export async function quickExportToPDF(
  file: File,
  filename: string,
  options: {
    chartTitle?: string;
    chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'radar';
    pdfTitle?: string;
    pdfAuthor?: string;
  } = {}
) {
  const { parseFile, generateSummaryStats } = await import('./dataParser');
  const { generateChart } = await import('./chartGenerator');
  const { exportSummaryReport } = await import('./exportPDF');

  const dataTable = await parseFile(file);
  const stats = generateSummaryStats(dataTable);

  const chartData = dataTable.rows.map((row) => ({
    label: row[0],
    value: Number(row[1]) || 0,
  }));

  const chartConfig = generateChart(chartData, {
    title: options.chartTitle || 'Data Visualization',
  });

  const charts = [
    {
      type: chartConfig.type as any,
      title: options.chartTitle || 'Data Visualization',
      config: chartConfig,
    },
  ];

  await exportSummaryReport(
    options.pdfTitle || 'Data Analysis Report',
    {
      totalRows: stats.rowCount,
      totalColumns: stats.columnCount,
      completeness: `${stats.summary.completeness}%`,
    },
    charts,
    filename,
    {
      author: options.pdfAuthor,
      includePageNumbers: true,
      includeTableOfContents: true,
    }
  );
}

/**
 * Quick export: Generate chart and export to PowerPoint in one step
 *
 * @param file - Data file
 * @param filename - Output filename
 * @param options - Combined options
 *
 * @example
 * ```typescript
 * await quickExportToPPT(file, 'sales-presentation', {
 *   chartTitle: 'Q4 Sales',
 *   pptTitle: 'Sales Overview',
 *   theme: 'blue',
 * });
 * ```
 */
export async function quickExportToPPT(
  file: File,
  filename: string,
  options: {
    chartTitle?: string;
    chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'radar';
    pptTitle?: string;
    pptSubtitle?: string;
    theme?: 'default' | 'dark' | 'blue' | 'green';
  } = {}
) {
  const { parseFile, generateSummaryStats } = await import('./dataParser');
  const { generateChart } = await import('./chartGenerator');
  const { exportChartsToPPT } = await import('./exportPPT');

  const dataTable = await parseFile(file);
  const stats = generateSummaryStats(dataTable);

  const chartData = dataTable.rows.map((row) => ({
    label: row[0],
    value: Number(row[1]) || 0,
  }));

  const chartConfig = generateChart(chartData, {
    title: options.chartTitle || 'Data Visualization',
  });

  const charts = [
    {
      type: chartConfig.type as any,
      title: options.chartTitle || 'Data Visualization',
      config: chartConfig,
      statistics: {
        totalRows: stats.rowCount,
        totalColumns: stats.columnCount,
        completeness: `${stats.summary.completeness}%`,
      },
    },
  ];

  await exportChartsToPPT(charts, filename, {
    title: options.pptTitle,
    subtitle: options.pptSubtitle,
    theme: options.theme,
    includeDataTables: true,
    includeSpeakerNotes: true,
  });
}

/**
 * Batch process multiple files
 *
 * @param files - Array of files to process
 * @returns Array of processed results
 *
 * @example
 * ```typescript
 * const results = await batchProcessFiles(files);
 * results.forEach(result => {
 *   console.log(result.filename, result.stats);
 * });
 * ```
 */
export async function batchProcessFiles(files: File[]) {
  const { parseFile, generateSummaryStats, detectDataTypes } = await import('./dataParser');

  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const dataTable = await parseFile(file);
        const stats = generateSummaryStats(dataTable);
        const columnTypes = detectDataTypes(dataTable);

        return {
          filename: file.name,
          success: true,
          dataTable,
          stats,
          columnTypes,
          error: null,
        };
      } catch (error) {
        return {
          filename: file.name,
          success: false,
          dataTable: null,
          stats: null,
          columnTypes: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  return results;
}

// ============================================================================
// VERSION INFO
// ============================================================================

export const VERSION = '1.0.0';
export const LIBRARY_NAME = 'Data Visualization Agent';
export const LIBRARY_DESCRIPTION =
  'Comprehensive data visualization toolkit for chart generation, data parsing, and export';

/**
 * Get library information
 */
export function getLibraryInfo() {
  return {
    name: LIBRARY_NAME,
    version: VERSION,
    description: LIBRARY_DESCRIPTION,
    capabilities: [
      'CSV, JSON, and Excel file parsing',
      'Automatic data type detection',
      'Summary statistics generation',
      'Bar, Line, Pie, Scatter, and Radar charts',
      'PDF export with charts and tables',
      'PowerPoint export with professional templates',
      'Batch file processing',
      'Type-safe TypeScript interfaces',
    ],
  };
}
