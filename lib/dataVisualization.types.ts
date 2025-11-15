/**
 * Data Visualization Types
 *
 * Consolidated TypeScript types and interfaces for the Data Visualization Agent.
 * This file provides type safety across chart generation, data parsing, and export utilities.
 *
 * @module dataVisualization.types
 */

import type { ChartConfiguration, ChartType } from 'chart.js';

/**
 * ============================================================================
 * DATA STRUCTURES
 * ============================================================================
 */

/**
 * Represents a parsed data table from CSV, JSON, or Excel files
 */
export interface DataTable {
  /** Column headers */
  headers: string[];
  /** Data rows (array of arrays) */
  rows: any[][];
  /** Total number of data rows */
  rowCount: number;
  /** Total number of columns */
  columnCount: number;
  /** Optional metadata about the file */
  metadata?: {
    fileName?: string;
    fileSize?: number;
    parsedAt?: Date;
  };
}

/**
 * Column type detection information
 */
export interface ColumnType {
  /** Column name */
  name: string;
  /** Detected data type */
  type: 'number' | 'string' | 'date' | 'boolean' | 'mixed';
  /** Count of null/empty values */
  nullCount: number;
  /** Count of unique values */
  uniqueCount: number;
  /** Sample values from the column */
  sampleValues: any[];
}

/**
 * Column types for all columns in a dataset
 */
export interface ColumnTypes {
  /** Array of column type information */
  columns: ColumnType[];
  /** Total number of rows in the dataset */
  totalRows: number;
}

/**
 * Summary statistics for a single column
 */
export interface ColumnStats {
  /** Column name */
  name: string;
  /** Column data type */
  type: string;
  /** Count of non-null values */
  count: number;
  /** Count of null values */
  nullCount: number;
  /** Count of unique values */
  uniqueCount: number;
  /** Minimum value (numeric columns only) */
  min?: number;
  /** Maximum value (numeric columns only) */
  max?: number;
  /** Mean/average (numeric columns only) */
  mean?: number;
  /** Median value (numeric columns only) */
  median?: number;
  /** Most common value */
  mode?: any;
  /** Standard deviation (numeric columns only) */
  stdDev?: number;
}

/**
 * Overall statistics for the entire dataset
 */
export interface Stats {
  /** Total number of rows */
  rowCount: number;
  /** Total number of columns */
  columnCount: number;
  /** Statistics for each column */
  columns: ColumnStats[];
  /** Summary metrics */
  summary: {
    /** Total number of cells in the dataset */
    totalCells: number;
    /** Total number of null/empty cells */
    totalNulls: number;
    /** Percentage of non-null cells (0-100) */
    completeness: number;
  };
}

/**
 * ============================================================================
 * CHART CONFIGURATION
 * ============================================================================
 */

/**
 * Chart generation options
 */
export interface ChartOptions {
  /** Chart title */
  title?: string;
  /** X-axis label */
  xLabel?: string;
  /** Y-axis label */
  yLabel?: string;
  /** Custom color scheme */
  colors?: string[];
  /** Show/hide legend */
  showLegend?: boolean;
  /** Show/hide grid lines */
  showGrid?: boolean;
  /** Enable/disable animations */
  animation?: boolean;
  /** Make chart responsive */
  responsive?: boolean;
  /** Maintain aspect ratio */
  maintainAspectRatio?: boolean;
  /** Aspect ratio (width/height) */
  aspectRatio?: number;
}

/**
 * Chart data with metadata
 */
export interface ChartData {
  /** Chart type */
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'radar';
  /** Chart.js configuration object */
  config?: ChartConfiguration;
  /** Chart title */
  title: string;
  /** Chart description/subtitle */
  description?: string;
  /** Raw data for the chart */
  data?: any[];
  /** Labels for the chart */
  labels?: string[];
  /** Datasets for multi-series charts */
  datasets?: any[];
  /** Canvas element (for image capture) */
  canvas?: HTMLCanvasElement;
  /** HTML element containing the chart */
  element?: HTMLElement;
  /** Pre-rendered image data (base64) */
  imageData?: string;
  /** AI-generated insights about the chart */
  insights?: string[];
  /** Statistical information about the data */
  statistics?: Record<string, any>;
}

/**
 * ============================================================================
 * CHAT & MESSAGES
 * ============================================================================
 */

/**
 * Chat message interface
 */
export interface ChatMessage {
  /** Message sender role */
  role: 'user' | 'assistant' | 'system';
  /** Message content */
  content: string;
  /** Message timestamp */
  timestamp?: Date | string;
  /** Optional message metadata */
  metadata?: {
    /** Message ID */
    id?: string;
    /** Parent message ID (for threading) */
    parentId?: string;
    /** Message type */
    type?: 'text' | 'chart' | 'data' | 'insight';
    /** Attached data */
    attachments?: any[];
  };
}

/**
 * Conversation thread
 */
export interface Conversation {
  /** Conversation ID */
  id: string;
  /** Conversation title */
  title: string;
  /** All messages in the conversation */
  messages: ChatMessage[];
  /** Generated charts */
  charts: ChartData[];
  /** Uploaded data files */
  dataTables: DataTable[];
  /** Conversation metadata */
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    totalMessages: number;
    totalCharts: number;
  };
}

/**
 * ============================================================================
 * EXPORT OPTIONS
 * ============================================================================
 */

/**
 * PDF export options
 */
export interface PDFExportOptions {
  /** Include message timestamps */
  includeTimestamps?: boolean;
  /** Include table of contents */
  includeTableOfContents?: boolean;
  /** Include page numbers */
  includePageNumbers?: boolean;
  /** Include header on each page */
  includeHeader?: boolean;
  /** Include footer on each page */
  includeFooter?: boolean;
  /** Document title */
  title?: string;
  /** Document author */
  author?: string;
  /** Document subject */
  subject?: string;
  /** Company/organization name */
  companyName?: string;
  /** Company logo (base64 or URL) */
  logo?: string;
}

/**
 * PowerPoint export options
 */
export interface PPTExportOptions {
  /** Presentation title */
  title?: string;
  /** Presentation subtitle */
  subtitle?: string;
  /** Author name */
  author?: string;
  /** Company/organization name */
  company?: string;
  /** Presentation subject */
  subject?: string;
  /** Color theme */
  theme?: 'default' | 'dark' | 'blue' | 'green';
  /** Include message timestamps */
  includeTimestamps?: boolean;
  /** Include speaker notes */
  includeSpeakerNotes?: boolean;
  /** Include data tables for each chart */
  includeDataTables?: boolean;
  /** Company logo (base64 or URL) */
  logo?: string;
}

/**
 * ============================================================================
 * ANALYSIS & INSIGHTS
 * ============================================================================
 */

/**
 * Data analysis request
 */
export interface AnalysisRequest {
  /** Data to analyze */
  data: DataTable;
  /** Type of analysis to perform */
  analysisType:
    | 'summary'
    | 'correlation'
    | 'distribution'
    | 'trend'
    | 'comparison'
    | 'custom';
  /** Specific columns to analyze */
  columns?: string[];
  /** Custom analysis parameters */
  parameters?: Record<string, any>;
}

/**
 * Data analysis result
 */
export interface AnalysisResult {
  /** Analysis type */
  type: string;
  /** Summary of findings */
  summary: string;
  /** Generated insights */
  insights: string[];
  /** Generated charts */
  charts: ChartData[];
  /** Statistical data */
  statistics: Record<string, any>;
  /** Recommendations */
  recommendations?: string[];
}

/**
 * Insight generation options
 */
export interface InsightOptions {
  /** Maximum number of insights to generate */
  maxInsights?: number;
  /** Minimum confidence level (0-1) */
  minConfidence?: number;
  /** Focus areas for insights */
  focusAreas?: string[];
  /** Include statistical significance */
  includeSignificance?: boolean;
}

/**
 * Generated insight
 */
export interface Insight {
  /** Insight title */
  title: string;
  /** Insight description */
  description: string;
  /** Confidence level (0-1) */
  confidence: number;
  /** Supporting data */
  data?: any;
  /** Related chart (if applicable) */
  chart?: ChartData;
  /** Insight category */
  category: 'trend' | 'anomaly' | 'pattern' | 'correlation' | 'summary';
}

/**
 * ============================================================================
 * UTILITY TYPES
 * ============================================================================
 */

/**
 * File type for data import
 */
export type DataFileType = 'csv' | 'json' | 'xlsx' | 'xls';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Filter operator
 */
export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'is_null'
  | 'is_not_null';

/**
 * Data filter
 */
export interface DataFilter {
  /** Column to filter */
  column: string;
  /** Filter operator */
  operator: FilterOperator;
  /** Filter value */
  value?: any;
}

/**
 * Data transformation
 */
export interface DataTransformation {
  /** Transformation type */
  type: 'filter' | 'sort' | 'aggregate' | 'pivot' | 'join' | 'custom';
  /** Transformation parameters */
  parameters: Record<string, any>;
}

/**
 * Aggregation function
 */
export type AggregateFunction =
  | 'sum'
  | 'avg'
  | 'count'
  | 'min'
  | 'max'
  | 'median'
  | 'mode'
  | 'stddev';

/**
 * Aggregation configuration
 */
export interface AggregateConfig {
  /** Column to aggregate */
  column: string;
  /** Aggregation function */
  function: AggregateFunction;
  /** Group by columns */
  groupBy?: string[];
}

/**
 * ============================================================================
 * API RESPONSE TYPES
 * ============================================================================
 */

/**
 * Standard API response
 */
export interface ApiResponse<T = any> {
  /** Success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message (if failed) */
  error?: string;
  /** Response metadata */
  metadata?: {
    timestamp: Date;
    duration: number;
    version: string;
  };
}

/**
 * Chart generation response
 */
export interface ChartGenerationResponse {
  /** Generated chart */
  chart: ChartData;
  /** Chart suggestions */
  suggestions?: string[];
  /** Alternative chart types */
  alternatives?: ChartType[];
}

/**
 * Data upload response
 */
export interface DataUploadResponse {
  /** Parsed data table */
  dataTable: DataTable;
  /** Data summary */
  summary: Stats;
  /** Column types */
  columnTypes: ColumnTypes;
  /** Upload warnings (if any) */
  warnings?: string[];
}

/**
 * ============================================================================
 * VALIDATION TYPES
 * ============================================================================
 */

/**
 * Validation result
 */
export interface ValidationResult {
  /** Validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Field/location of error */
  field?: string;
  /** Additional error details */
  details?: any;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Warning message */
  message: string;
  /** Field/location of warning */
  field?: string;
  /** Suggested fix */
  suggestion?: string;
}

/**
 * ============================================================================
 * EXPORT TYPE GUARDS
 * ============================================================================
 */

/**
 * Type guard to check if value is a DataTable
 */
export function isDataTable(value: any): value is DataTable {
  return (
    value !== null &&
    typeof value === 'object' &&
    Array.isArray(value.headers) &&
    Array.isArray(value.rows) &&
    typeof value.rowCount === 'number' &&
    typeof value.columnCount === 'number'
  );
}

/**
 * Type guard to check if value is a ChartData
 */
export function isChartData(value: any): value is ChartData {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    typeof value.title === 'string' &&
    ['bar', 'line', 'pie', 'scatter', 'radar'].includes(value.type)
  );
}

/**
 * Type guard to check if value is a ChatMessage
 */
export function isChatMessage(value: any): value is ChatMessage {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.role === 'string' &&
    typeof value.content === 'string' &&
    ['user', 'assistant', 'system'].includes(value.role)
  );
}

/**
 * ============================================================================
 * UTILITY HELPER TYPES
 * ============================================================================
 */

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of type T that have value type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Omit properties by value type
 */
export type OmitByValueType<T, V> = Pick<T, Exclude<keyof T, KeysOfType<T, V>>>;

/**
 * Pick properties by value type
 */
export type PickByValueType<T, V> = Pick<T, KeysOfType<T, V>>;

/**
 * ============================================================================
 * RE-EXPORTS
 * ============================================================================
 */

// Re-export Chart.js types for convenience
export type { ChartConfiguration, ChartType } from 'chart.js';
