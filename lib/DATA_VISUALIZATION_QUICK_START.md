# Data Visualization Agent - Quick Start Guide

## 30-Second Setup

```typescript
import {
  parseCSV,
  generateBarChart,
  exportChatToPDF
} from '@/lib/dataVisualization';
```

That's it! All dependencies are already installed.

## Common Use Cases

### 1. Upload CSV and Create Chart (< 10 lines)

```typescript
import { createVisualizationWorkflow } from '@/lib/dataVisualization';

// One function does everything: parse → analyze → visualize
const result = await createVisualizationWorkflow(file, 'bar', {
  title: 'Sales by Region'
});

console.log(result.stats);      // Statistics
console.log(result.chart);      // Chart.js config
console.log(result.chartType);  // Auto-detected type
```

### 2. Parse Any Data File

```typescript
import { parseFile, generateSummaryStats } from '@/lib/dataVisualization';

// Auto-detects CSV, JSON, or Excel
const dataTable = await parseFile(file);

// Get statistics automatically
const stats = generateSummaryStats(dataTable);
console.log(`Completeness: ${stats.summary.completeness}%`);
```

### 3. Generate Chart in React

```typescript
import { Bar } from 'react-chartjs-2';
import { generateBarChart } from '@/lib/dataVisualization';

function MyChart({ data }) {
  const chartConfig = generateBarChart(data, {
    title: 'Monthly Sales',
    xLabel: 'Month',
    yLabel: 'Revenue ($)'
  });

  return <Bar {...chartConfig} />;
}
```

### 4. Export to PDF (One Line!)

```typescript
import { quickExportToPDF } from '@/lib/dataVisualization';

// Parse, chart, and export in one step
await quickExportToPDF(file, 'report', {
  chartTitle: 'Sales Analysis',
  pdfTitle: 'Q4 Report'
});
```

### 5. Export to PowerPoint (One Line!)

```typescript
import { quickExportToPPT } from '@/lib/dataVisualization';

await quickExportToPPT(file, 'presentation', {
  chartTitle: 'Performance',
  theme: 'blue'
});
```

## Chart Types Available

```typescript
import {
  generateBarChart,
  generateLineChart,
  generatePieChart,
  generateScatterChart,
  generateRadarChart,
  detectChartType  // Auto-detect best type
} from '@/lib/dataVisualization';
```

### Bar Chart
```typescript
const data = [
  { label: 'Jan', value: 100 },
  { label: 'Feb', value: 150 }
];
const chart = generateBarChart(data, { title: 'Sales' });
```

### Line Chart (Trends)
```typescript
const chart = generateLineChart(data, {
  title: 'Growth Trend',
  colors: ['#3b82f6']
});
```

### Pie Chart (Percentages)
```typescript
const chart = generatePieChart(data, {
  title: 'Market Share'
});
// Automatically shows percentages in tooltips
```

### Scatter Plot (Correlation)
```typescript
const data = [
  { x: 10, y: 20 },
  { x: 15, y: 25 }
];
const chart = generateScatterChart(data);
```

### Radar Chart (Multi-dimensional)
```typescript
const data = [
  { label: 'Speed', value: 85 },
  { label: 'Quality', value: 90 }
];
const chart = generateRadarChart(data);
```

## File Parsing

### CSV Files
```typescript
import { parseCSV } from '@/lib/dataVisualization';

const dataTable = await parseCSV(file);
// Returns: { headers, rows, rowCount, columnCount }
```

### JSON Files
```typescript
import { parseJSON } from '@/lib/dataVisualization';

const dataTable = await parseJSON(file);
```

### Excel Files
```typescript
import { parseExcel } from '@/lib/dataVisualization';

const dataTable = await parseExcel(file);
// Supports .xlsx and .xls
```

### Auto-Detect Format
```typescript
import { parseFile } from '@/lib/dataVisualization';

const dataTable = await parseFile(file);
// Automatically detects CSV, JSON, or Excel
```

## Statistics Generation

```typescript
import { generateSummaryStats, detectDataTypes } from '@/lib/dataVisualization';

// Get column types
const types = detectDataTypes(dataTable);
console.log(types.columns[0].type); // 'number', 'string', 'date', etc.

// Get statistics
const stats = generateSummaryStats(dataTable);

// For numeric columns, get:
stats.columns.forEach(col => {
  if (col.mean) {
    console.log(`${col.name}:`);
    console.log(`  Mean: ${col.mean}`);
    console.log(`  Median: ${col.median}`);
    console.log(`  Std Dev: ${col.stdDev}`);
    console.log(`  Min: ${col.min}, Max: ${col.max}`);
  }
});
```

## Export Options

### PDF Export

**Simple:**
```typescript
import { exportChatToPDF } from '@/lib/dataVisualization';

await exportChatToPDF(messages, charts, 'report');
```

**With Options:**
```typescript
await exportChatToPDF(messages, charts, 'report', {
  title: 'Sales Report',
  author: 'John Doe',
  companyName: 'Acme Corp',
  includeTableOfContents: true,
  includePageNumbers: true
});
```

### PowerPoint Export

**Simple:**
```typescript
import { exportChatToPPT } from '@/lib/dataVisualization';

await exportChatToPPT(messages, charts, 'presentation');
```

**With Options:**
```typescript
await exportChatToPPT(messages, charts, 'presentation', {
  title: 'Q4 Review',
  subtitle: 'Performance Analysis',
  theme: 'blue',  // 'default', 'dark', 'blue', 'green'
  includeSpeakerNotes: true,
  includeDataTables: true
});
```

## Batch Processing

```typescript
import { batchProcessFiles } from '@/lib/dataVisualization';

const results = await batchProcessFiles([file1, file2, file3]);

results.forEach(result => {
  if (result.success) {
    console.log(`✓ ${result.filename}: ${result.stats.rowCount} rows`);
  } else {
    console.log(`✗ ${result.filename}: ${result.error}`);
  }
});
```

## TypeScript Support

All functions are fully typed:

```typescript
import type {
  DataTable,
  ChartData,
  ChartOptions,
  Stats,
  PDFExportOptions,
  PPTExportOptions
} from '@/lib/dataVisualization';

const options: ChartOptions = {
  title: 'My Chart',
  showLegend: true,
  colors: ['#3b82f6']
};
```

## Error Handling

```typescript
try {
  const data = await parseCSV(file);
  const chart = generateBarChart(data.rows);
  await exportChatToPDF(messages, [chart], 'report');
} catch (error) {
  console.error('Error:', error.message);
  // Errors are descriptive and actionable
}
```

## Complete Example: Chat Agent with Visualization

```typescript
import {
  parseFile,
  generateSummaryStats,
  generateBarChart,
  exportChatToPDF
} from '@/lib/dataVisualization';

async function handleFileUpload(file: File) {
  // 1. Parse file
  const dataTable = await parseFile(file);

  // 2. Generate statistics
  const stats = generateSummaryStats(dataTable);

  // 3. Create visualization
  const chartData = dataTable.rows.map(row => ({
    label: row[0],
    value: row[1]
  }));

  const chartConfig = generateBarChart(chartData, {
    title: 'Data Visualization',
    xLabel: 'Category',
    yLabel: 'Value'
  });

  // 4. Show in UI
  setChartConfig(chartConfig);
  setStats(stats);

  // 5. Export to PDF (optional)
  const charts = [{
    type: 'bar',
    title: 'Data Visualization',
    canvas: chartCanvasRef.current
  }];

  await exportChatToPDF(messages, charts, 'analysis');
}
```

## Performance Tips

- **Large Files**: Parser handles up to 100MB efficiently
- **Chart Rendering**: Use `animation: false` for large datasets
- **PDF Generation**: Runs asynchronously, won't block UI
- **Memory**: Charts are automatically cleaned up

## Color Schemes

Pre-defined color schemes available:

```typescript
import { COLOR_SCHEMES } from '@/lib/dataVisualization';

const chart = generateBarChart(data, {
  colors: COLOR_SCHEMES.default,    // Blue, red, green, amber...
  // or: COLOR_SCHEMES.professional  // Darker, more corporate
  // or: COLOR_SCHEMES.gradient      // With transparency
});
```

## Custom Colors

```typescript
const chart = generateBarChart(data, {
  colors: ['#FF6B6B', '#4ECDC4', '#45B7D1']  // Your brand colors
});
```

## Theme Options (PowerPoint)

```typescript
await exportChatToPPT(messages, charts, 'presentation', {
  theme: 'default',  // Blue and white
  // theme: 'dark',   // Dark background
  // theme: 'blue',   // Corporate blue
  // theme: 'green',  // Eco-friendly green
});
```

## Common Patterns

### Pattern 1: Upload → Visualize → Export
```typescript
const result = await createVisualizationWorkflow(file);
await exportChatToPDF([], [result.chart], 'report');
```

### Pattern 2: Multiple Files → Batch Process
```typescript
const results = await batchProcessFiles(files);
const successful = results.filter(r => r.success);
console.log(`Processed ${successful.length}/${files.length} files`);
```

### Pattern 3: Custom Workflow
```typescript
const data = await parseCSV(file);
const stats = generateSummaryStats(data);
const chart = generateLineChart(data.rows);
await exportChatToPPT([], [chart], 'presentation', { theme: 'blue' });
```

## Need More Help?

- **Full Documentation**: See `DATA_VISUALIZATION_README.md`
- **Examples**: See `dataVisualization.example.ts`
- **Types**: See `dataVisualization.types.ts`
- **Implementation Details**: See `DATA_VISUALIZATION_IMPLEMENTATION_SUMMARY.md`

## Library Info

```typescript
import { getLibraryInfo } from '@/lib/dataVisualization';

console.log(getLibraryInfo());
// {
//   name: 'Data Visualization Agent',
//   version: '1.0.0',
//   capabilities: [...]
// }
```

---

**That's it!** You're ready to build powerful data visualization features.

Start with the simple examples above, then explore the full documentation for advanced features.
