# Data Visualization Agent

A comprehensive TypeScript library for data visualization, parsing, and export functionality. Built for the ChatGPT Philippines platform with production-ready code and full type safety.

## Features

### 📊 Chart Generation
- **Multiple Chart Types**: Bar, Line, Pie, Scatter, Radar
- **Auto-detection**: Automatically suggests appropriate chart types based on data
- **Beautiful Defaults**: Professional color schemes and gradients
- **Responsive**: Mobile-first, responsive configurations
- **Accessible**: ARIA labels and keyboard navigation support
- **Customizable**: Extensive options for colors, labels, legends, and more

### 📁 Data Parsing
- **Multi-format Support**: CSV, JSON, Excel (XLSX/XLS)
- **Type Detection**: Automatic detection of number, string, date, boolean types
- **Statistics**: Comprehensive summary statistics (mean, median, mode, std dev)
- **Data Quality**: Null counting, uniqueness analysis, completeness metrics
- **Error Handling**: Graceful handling of malformed data

### 📄 PDF Export
- **Professional Layout**: Multi-page PDFs with headers, footers, page numbers
- **Chart Embedding**: High-quality chart images embedded in PDFs
- **Chat History**: Include conversation history with timestamps
- **Table of Contents**: Automatic TOC generation
- **Data Tables**: Export raw data in formatted tables
- **Custom Branding**: Add logos, company names, custom headers

### 📊 PowerPoint Export
- **Professional Templates**: Corporate blue theme with multiple color schemes
- **Title Slides**: Beautiful title and agenda slides
- **Chart Slides**: One chart per slide with insights
- **Data Tables**: Separate slides with formatted data tables
- **Speaker Notes**: Automatic generation of speaker notes with insights
- **Statistics Slides**: Summary statistics in visual grid format

## Installation

All required dependencies are already installed in the project:

```json
{
  "chart.js": "^4.5.1",
  "react-chartjs-2": "^5.3.1",
  "html2canvas": "^1.4.1",
  "jspdf": "^3.0.3",
  "jspdf-autotable": "^5.0.2",
  "pptxgenjs": "^4.0.1",
  "papaparse": "^5.5.3",
  "xlsx": "^0.18.5"
}
```

## Quick Start

### 1. Basic Chart Generation

```typescript
import { generateBarChart, generateLineChart } from '@/lib/dataVisualization';

// Generate a bar chart
const data = [
  { label: 'January', value: 65 },
  { label: 'February', value: 59 },
  { label: 'March', value: 80 }
];

const chartConfig = generateBarChart(data, {
  title: 'Monthly Sales',
  xLabel: 'Month',
  yLabel: 'Revenue ($)',
  colors: ['#3b82f6', '#ef4444', '#10b981']
});

// Use with react-chartjs-2
<Bar data={chartConfig.data} options={chartConfig.options} />
```

### 2. Parse Data Files

```typescript
import { parseCSV, generateSummaryStats } from '@/lib/dataVisualization';

// Parse CSV file
const dataTable = await parseCSV(file);
console.log(`Parsed ${dataTable.rowCount} rows with ${dataTable.columnCount} columns`);

// Generate statistics
const stats = generateSummaryStats(dataTable);
console.log(`Data completeness: ${stats.summary.completeness}%`);

stats.columns.forEach(col => {
  console.log(`${col.name}: ${col.type} (${col.uniqueCount} unique values)`);
  if (col.mean) {
    console.log(`  Mean: ${col.mean}, Median: ${col.median}`);
  }
});
```

### 3. Export to PDF

```typescript
import { exportChatToPDF } from '@/lib/dataVisualization';

await exportChatToPDF(
  messages,
  charts,
  'data-analysis-report',
  {
    title: 'Q4 Sales Analysis',
    author: 'John Doe',
    companyName: 'Acme Corp',
    includeTableOfContents: true,
    includePageNumbers: true
  }
);
```

### 4. Export to PowerPoint

```typescript
import { exportChatToPPT } from '@/lib/dataVisualization';

await exportChatToPPT(
  messages,
  charts,
  'sales-presentation',
  {
    title: 'Q4 Performance Review',
    subtitle: 'Sales & Marketing Analysis',
    theme: 'blue',
    includeSpeakerNotes: true,
    includeDataTables: true
  }
);
```

### 5. Complete Workflow

```typescript
import { createVisualizationWorkflow } from '@/lib/dataVisualization';

// One-step workflow: parse, analyze, and generate chart
const result = await createVisualizationWorkflow(file, 'bar', {
  title: 'Sales by Region',
  xLabel: 'Region',
  yLabel: 'Revenue ($)'
});

console.log(result.stats);
console.log(result.chart);
console.log(result.chartType); // Auto-detected or specified type
```

## API Reference

### Chart Generation

#### `generateBarChart(data, options)`
Creates a bar chart configuration.

**Parameters:**
- `data`: Array of `{ label: string, value: number }`
- `options`: ChartOptions (optional)
  - `title`: Chart title
  - `xLabel`: X-axis label
  - `yLabel`: Y-axis label
  - `colors`: Array of color strings
  - `showLegend`: Boolean (default: true)
  - `showGrid`: Boolean (default: true)

**Returns:** Chart.js ChartConfiguration object

#### `generateLineChart(data, options)`
Creates a line chart with smooth curves and fill.

#### `generatePieChart(data, options)`
Creates a pie chart with percentage tooltips.

#### `generateScatterChart(data, options)`
Creates a scatter plot for correlation analysis.

#### `generateRadarChart(data, options)`
Creates a radar chart for multi-dimensional data.

#### `detectChartType(data)`
Auto-detects the most appropriate chart type.

### Data Parsing

#### `parseCSV(file)`
Parses CSV files with automatic type detection.

**Returns:** DataTable
```typescript
{
  headers: string[],
  rows: any[][],
  rowCount: number,
  columnCount: number,
  metadata: { fileName, fileSize, parsedAt }
}
```

#### `parseJSON(file)`
Parses JSON files (arrays or objects).

#### `parseExcel(file)`
Parses Excel files (.xlsx, .xls).

#### `parseFile(file)`
Auto-detects file type and parses accordingly.

#### `detectDataTypes(dataTable)`
Detects column types (number, string, date, boolean, mixed).

**Returns:** ColumnTypes
```typescript
{
  columns: [
    {
      name: string,
      type: 'number' | 'string' | 'date' | 'boolean' | 'mixed',
      nullCount: number,
      uniqueCount: number,
      sampleValues: any[]
    }
  ],
  totalRows: number
}
```

#### `generateSummaryStats(dataTable)`
Generates comprehensive statistics.

**Returns:** Stats
```typescript
{
  rowCount: number,
  columnCount: number,
  columns: [
    {
      name: string,
      type: string,
      count: number,
      nullCount: number,
      uniqueCount: number,
      min?: number,
      max?: number,
      mean?: number,
      median?: number,
      mode?: any,
      stdDev?: number
    }
  ],
  summary: {
    totalCells: number,
    totalNulls: number,
    completeness: number
  }
}
```

### PDF Export

#### `exportChatToPDF(messages, charts, filename, options)`
Exports chat and charts to PDF.

**Parameters:**
- `messages`: Array of ChatMessage
- `charts`: Array of ChartData
- `filename`: Output filename (without .pdf)
- `options`: PDFExportOptions
  - `title`: Document title
  - `author`: Author name
  - `companyName`: Company name
  - `logo`: Logo image (base64 or URL)
  - `includeTimestamps`: Boolean
  - `includeTableOfContents`: Boolean
  - `includePageNumbers`: Boolean

#### `exportTableToPDF(title, headers, rows, filename, options)`
Exports a data table to PDF.

#### `exportSummaryReport(title, summary, charts, filename, options)`
Creates a summary report with statistics and charts.

### PowerPoint Export

#### `exportChatToPPT(messages, charts, filename, options)`
Exports chat and charts to PowerPoint.

**Parameters:**
- `messages`: Array of ChatMessage
- `charts`: Array of ChartData
- `filename`: Output filename (without .pptx)
- `options`: PPTExportOptions
  - `title`: Presentation title
  - `subtitle`: Subtitle
  - `theme`: 'default' | 'dark' | 'blue' | 'green'
  - `author`: Author name
  - `company`: Company name
  - `includeSpeakerNotes`: Boolean
  - `includeDataTables`: Boolean

#### `exportChartToPPT(chart, filename, options)`
Exports a single chart to PowerPoint.

#### `exportChartsToPPT(charts, filename, options)`
Exports multiple charts (no chat history).

### Utility Functions

#### `createVisualizationWorkflow(file, chartType, options)`
Complete workflow: parse → analyze → generate chart.

#### `quickExportToPDF(file, filename, options)`
One-step: parse → chart → PDF export.

#### `quickExportToPPT(file, filename, options)`
One-step: parse → chart → PowerPoint export.

#### `batchProcessFiles(files)`
Process multiple files in parallel.

## Examples

### Example 1: Sales Dashboard

```typescript
import { parseCSV, generateBarChart, generateLineChart, exportChatToPDF } from '@/lib/dataVisualization';

// Parse sales data
const salesData = await parseCSV(salesFile);

// Generate bar chart for regional sales
const regionalChart = generateBarChart(
  salesData.rows.map(row => ({ label: row[0], value: row[1] })),
  { title: 'Sales by Region', yLabel: 'Revenue ($)' }
);

// Generate line chart for monthly trends
const trendChart = generateLineChart(
  salesData.rows.map(row => ({ label: row[2], value: row[3] })),
  { title: 'Monthly Sales Trend' }
);

// Export to PDF
await exportChatToPDF(
  [],
  [
    { type: 'bar', title: 'Regional Sales', canvas: regionalChartCanvas },
    { type: 'line', title: 'Sales Trend', canvas: trendChartCanvas }
  ],
  'sales-dashboard',
  { title: 'Sales Dashboard Q4 2024' }
);
```

### Example 2: Data Analysis Chat Export

```typescript
import { exportChatToPDF } from '@/lib/dataVisualization';

const messages = [
  { role: 'user', content: 'Analyze this sales data', timestamp: new Date() },
  { role: 'assistant', content: 'I found that...', timestamp: new Date() }
];

const charts = [
  {
    type: 'pie',
    title: 'Market Share',
    description: 'Product distribution across regions',
    canvas: chartCanvas,
    insights: [
      'Product A dominates with 45% market share',
      'Region 1 shows 20% growth YoY'
    ]
  }
];

await exportChatToPDF(messages, charts, 'analysis-report', {
  title: 'Data Analysis Report',
  includeTableOfContents: true,
  includeSpeakerNotes: true
});
```

### Example 3: Batch Processing

```typescript
import { batchProcessFiles } from '@/lib/dataVisualization';

const files = [salesFile, inventoryFile, customersFile];
const results = await batchProcessFiles(files);

results.forEach(result => {
  if (result.success) {
    console.log(`${result.filename}: ${result.stats.rowCount} rows`);
    console.log(`Completeness: ${result.stats.summary.completeness}%`);
  } else {
    console.error(`${result.filename}: ${result.error}`);
  }
});
```

## TypeScript Support

All functions are fully typed with comprehensive TypeScript interfaces:

```typescript
import type {
  DataTable,
  ColumnTypes,
  Stats,
  ChartOptions,
  ChartData,
  ChatMessage,
  PDFExportOptions,
  PPTExportOptions
} from '@/lib/dataVisualization';
```

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  const dataTable = await parseCSV(file);
  const chart = generateBarChart(data, options);
  await exportChatToPDF(messages, charts, 'report');
} catch (error) {
  console.error('Error:', error.message);
  // Error messages are descriptive and actionable
}
```

## Performance Considerations

- **Large Files**: Parser handles files up to 100MB efficiently
- **Chart Rendering**: Uses canvas for optimal performance
- **PDF Generation**: Asynchronous operations prevent UI blocking
- **Memory Management**: Automatic cleanup of canvas elements

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive charts supported

## Contributing

When adding new features:
1. Maintain TypeScript type safety
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Handle errors gracefully
5. Write unit tests

## License

Part of the ChatGPT Philippines platform.

## Support

For issues or questions, contact the development team.
