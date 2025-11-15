/**
 * Data Parser Utility
 *
 * Parses CSV, JSON, and Excel files and provides data analysis capabilities.
 * Automatically detects column types and generates summary statistics.
 *
 * @module dataParser
 */

import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Represents a parsed data table
 */
export interface DataTable {
  headers: string[];
  rows: any[][];
  rowCount: number;
  columnCount: number;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    parsedAt?: Date;
  };
}

/**
 * Column type information
 */
export interface ColumnType {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean' | 'mixed';
  nullCount: number;
  uniqueCount: number;
  sampleValues: any[];
}

/**
 * Column types for all columns
 */
export interface ColumnTypes {
  columns: ColumnType[];
  totalRows: number;
}

/**
 * Summary statistics for a column
 */
export interface ColumnStats {
  name: string;
  type: string;
  count: number;
  nullCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: any;
  stdDev?: number;
}

/**
 * Overall statistics for the dataset
 */
export interface Stats {
  rowCount: number;
  columnCount: number;
  columns: ColumnStats[];
  summary: {
    totalCells: number;
    totalNulls: number;
    completeness: number; // Percentage of non-null cells
  };
}

/**
 * Parse CSV file
 *
 * @param file - File object to parse
 * @returns Promise resolving to DataTable
 *
 * @example
 * ```typescript
 * const dataTable = await parseCSV(file);
 * console.log(`Parsed ${dataTable.rowCount} rows`);
 * ```
 */
export async function parseCSV(file: File): Promise<DataTable> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          const allRows = results.data as any[][];

          // Remove empty rows
          const nonEmptyRows = allRows.filter((row) =>
            row.some((cell) => cell !== null && cell !== undefined && cell !== '')
          );

          if (nonEmptyRows.length === 0) {
            reject(new Error('CSV file contains no valid data'));
            return;
          }

          // First row as headers
          const headers = nonEmptyRows[0].map((h: any) =>
            String(h || '').trim()
          );
          const rows = nonEmptyRows.slice(1);

          // Clean up data - convert empty strings to null
          const cleanRows = rows.map((row) =>
            row.map((cell) => {
              if (cell === '' || cell === null || cell === undefined) {
                return null;
              }
              return cell;
            })
          );

          const dataTable: DataTable = {
            headers,
            rows: cleanRows,
            rowCount: cleanRows.length,
            columnCount: headers.length,
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              parsedAt: new Date(),
            },
          };

          resolve(dataTable);
        } catch (error) {
          reject(
            new Error(
              `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
          );
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings initially
    });
  });
}

/**
 * Parse JSON file
 *
 * @param file - File object to parse
 * @returns Promise resolving to DataTable
 *
 * @example
 * ```typescript
 * const dataTable = await parseJSON(file);
 * ```
 */
export async function parseJSON(file: File): Promise<DataTable> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const jsonData = JSON.parse(content);

        // Handle different JSON structures
        let arrayData: any[];

        if (Array.isArray(jsonData)) {
          arrayData = jsonData;
        } else if (typeof jsonData === 'object' && jsonData !== null) {
          // Try to find an array property
          const arrayProp = Object.values(jsonData).find(Array.isArray);
          if (arrayProp) {
            arrayData = arrayProp as any[];
          } else {
            // Convert object to single-row array
            arrayData = [jsonData];
          }
        } else {
          reject(new Error('JSON must be an array or object'));
          return;
        }

        if (arrayData.length === 0) {
          reject(new Error('JSON file contains no data'));
          return;
        }

        // Extract headers from first object
        const firstItem = arrayData[0];
        const headers = Object.keys(firstItem);

        // Convert to rows
        const rows = arrayData.map((item) =>
          headers.map((header) => {
            const value = item[header];
            return value === null || value === undefined ? null : value;
          })
        );

        const dataTable: DataTable = {
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            parsedAt: new Date(),
          },
        };

        resolve(dataTable);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Parse Excel file
 *
 * @param file - File object to parse
 * @returns Promise resolving to DataTable
 *
 * @example
 * ```typescript
 * const dataTable = await parseExcel(file);
 * ```
 */
export async function parseExcel(file: File): Promise<DataTable> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error('Excel file contains no sheets'));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to array of arrays
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          raw: false, // Format dates and numbers as strings
        });

        if (rawData.length === 0) {
          reject(new Error('Excel sheet is empty'));
          return;
        }

        // Remove empty rows
        const nonEmptyRows = rawData.filter((row) =>
          row.some((cell) => cell !== null && cell !== undefined && cell !== '')
        );

        if (nonEmptyRows.length < 2) {
          reject(new Error('Excel sheet must have headers and at least one data row'));
          return;
        }

        // First row as headers
        const headers = nonEmptyRows[0].map((h: any) =>
          String(h || '').trim()
        );
        const rows = nonEmptyRows.slice(1);

        const dataTable: DataTable = {
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            parsedAt: new Date(),
          },
        };

        resolve(dataTable);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Detect data types for all columns
 *
 * @param data - DataTable to analyze
 * @returns ColumnTypes with type information
 *
 * @example
 * ```typescript
 * const types = detectDataTypes(dataTable);
 * console.log(types.columns[0].type); // 'number'
 * ```
 */
export function detectDataTypes(data: DataTable): ColumnTypes {
  const columns: ColumnType[] = data.headers.map((header, colIndex) => {
    const values = data.rows.map((row) => row[colIndex]).filter((v) => v !== null);

    const nullCount = data.rows.length - values.length;
    const uniqueValues = new Set(values);
    const uniqueCount = uniqueValues.size;

    // Get sample values (up to 5)
    const sampleValues = Array.from(uniqueValues).slice(0, 5);

    // Detect type
    let type: ColumnType['type'] = 'string';

    if (values.length === 0) {
      type = 'mixed';
    } else {
      // Check if all values are numbers
      const allNumbers = values.every((v) => {
        const num = Number(v);
        return !isNaN(num) && isFinite(num);
      });

      if (allNumbers) {
        type = 'number';
      } else {
        // Check if all values are booleans
        const allBooleans = values.every(
          (v) =>
            v === true ||
            v === false ||
            v === 'true' ||
            v === 'false' ||
            v === 'TRUE' ||
            v === 'FALSE' ||
            v === 'yes' ||
            v === 'no' ||
            v === 'YES' ||
            v === 'NO'
        );

        if (allBooleans) {
          type = 'boolean';
        } else {
          // Check if all values are dates
          const allDates = values.every((v) => {
            const date = new Date(v);
            return !isNaN(date.getTime());
          });

          if (allDates) {
            type = 'date';
          } else {
            type = 'string';
          }
        }
      }
    }

    return {
      name: header,
      type,
      nullCount,
      uniqueCount,
      sampleValues,
    };
  });

  return {
    columns,
    totalRows: data.rowCount,
  };
}

/**
 * Calculate statistics for a numeric array
 */
function calculateNumericStats(values: number[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / values.length;

  const median =
    values.length % 2 === 0
      ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
      : sorted[Math.floor(values.length / 2)];

  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  return { min, max, mean, median, stdDev };
}

/**
 * Find mode (most common value)
 */
function findMode(values: any[]): any {
  if (values.length === 0) return null;

  const frequency = new Map<any, number>();
  values.forEach((value) => {
    frequency.set(value, (frequency.get(value) || 0) + 1);
  });

  let maxFreq = 0;
  let mode: any = null;

  frequency.forEach((freq, value) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = value;
    }
  });

  return mode;
}

/**
 * Generate summary statistics for the dataset
 *
 * @param data - DataTable to analyze
 * @returns Stats object with comprehensive statistics
 *
 * @example
 * ```typescript
 * const stats = generateSummaryStats(dataTable);
 * console.log(`Completeness: ${stats.summary.completeness}%`);
 * ```
 */
export function generateSummaryStats(data: DataTable): Stats {
  const columnTypes = detectDataTypes(data);
  const totalCells = data.rowCount * data.columnCount;

  const columnStats: ColumnStats[] = data.headers.map((header, colIndex) => {
    const columnType = columnTypes.columns[colIndex];
    const values = data.rows.map((row) => row[colIndex]).filter((v) => v !== null);

    const baseStats: ColumnStats = {
      name: header,
      type: columnType.type,
      count: values.length,
      nullCount: columnType.nullCount,
      uniqueCount: columnType.uniqueCount,
      mode: findMode(values),
    };

    // Add numeric statistics if column is numeric
    if (columnType.type === 'number' && values.length > 0) {
      const numericValues = values.map(Number);
      const numStats = calculateNumericStats(numericValues);

      return {
        ...baseStats,
        ...numStats,
      };
    }

    return baseStats;
  });

  const totalNulls = columnStats.reduce((sum, col) => sum + col.nullCount, 0);
  const completeness = ((totalCells - totalNulls) / totalCells) * 100;

  return {
    rowCount: data.rowCount,
    columnCount: data.columnCount,
    columns: columnStats,
    summary: {
      totalCells,
      totalNulls,
      completeness: Math.round(completeness * 100) / 100,
    },
  };
}

/**
 * Parse file based on extension
 *
 * @param file - File object to parse
 * @returns Promise resolving to DataTable
 *
 * @example
 * ```typescript
 * const dataTable = await parseFile(file);
 * ```
 */
export async function parseFile(file: File): Promise<DataTable> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return parseCSV(file);
    case 'json':
      return parseJSON(file);
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      throw new Error(
        `Unsupported file type: ${extension}. Supported types: CSV, JSON, XLSX, XLS`
      );
  }
}

/**
 * Convert DataTable to array of objects
 *
 * @param data - DataTable to convert
 * @returns Array of objects with header keys
 */
export function dataTableToObjects(data: DataTable): Record<string, any>[] {
  return data.rows.map((row) => {
    const obj: Record<string, any> = {};
    data.headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Filter rows based on a condition
 *
 * @param data - DataTable to filter
 * @param predicate - Filter function
 * @returns Filtered DataTable
 */
export function filterRows(
  data: DataTable,
  predicate: (row: any[], index: number) => boolean
): DataTable {
  const filteredRows = data.rows.filter(predicate);

  return {
    ...data,
    rows: filteredRows,
    rowCount: filteredRows.length,
  };
}

/**
 * Sort rows by column
 *
 * @param data - DataTable to sort
 * @param columnIndex - Index of column to sort by
 * @param direction - Sort direction
 * @returns Sorted DataTable
 */
export function sortByColumn(
  data: DataTable,
  columnIndex: number,
  direction: 'asc' | 'desc' = 'asc'
): DataTable {
  const sortedRows = [...data.rows].sort((a, b) => {
    const aVal = a[columnIndex];
    const bVal = b[columnIndex];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    const aNum = Number(aVal);
    const bNum = Number(bVal);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    const aStr = String(aVal);
    const bStr = String(bVal);

    return direction === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  return {
    ...data,
    rows: sortedRows,
  };
}
