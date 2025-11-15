/**
 * Data Visualization Agent - Usage Examples
 *
 * This file demonstrates real-world usage patterns for the Data Visualization library.
 * Copy and adapt these examples for your own implementation.
 *
 * @module dataVisualization.example
 */

import {
  // Chart generation
  generateBarChart,
  generateLineChart,
  generatePieChart,
  generateScatterChart,
  generateRadarChart,
  detectChartType,

  // Data parsing
  parseCSV,
  parseJSON,
  parseExcel,
  parseFile,
  detectDataTypes,
  generateSummaryStats,
  dataTableToObjects,

  // PDF export
  exportChatToPDF,
  exportTableToPDF,
  exportSummaryReport,

  // PowerPoint export
  exportChatToPPT,
  exportChartToPPT,
  exportChartsToPPT,

  // Workflows
  createVisualizationWorkflow,
  quickExportToPDF,
  quickExportToPPT,
  batchProcessFiles,

  // Types
  type DataTable,
  type DVChartData,
  type DVChatMessage,
} from './dataVisualization';

// ============================================================================
// EXAMPLE 1: Basic Chart Generation
// ============================================================================

export async function example1_BasicChartGeneration() {
  console.log('=== Example 1: Basic Chart Generation ===\n');

  // Sample data
  const salesData = [
    { label: 'Q1', value: 45000 },
    { label: 'Q2', value: 52000 },
    { label: 'Q3', value: 61000 },
    { label: 'Q4', value: 58000 },
  ];

  // Generate bar chart
  const barChart = generateBarChart(salesData, {
    title: 'Quarterly Sales Performance',
    xLabel: 'Quarter',
    yLabel: 'Revenue ($)',
    showLegend: true,
    showGrid: true,
  });

  console.log('Bar chart configuration:', barChart.type);
  console.log('Chart has', barChart.data.datasets[0].data.length, 'data points');

  // Generate line chart for trends
  const lineChart = generateLineChart(salesData, {
    title: 'Sales Trend',
    colors: ['#3b82f6'],
  });

  console.log('Line chart configuration:', lineChart.type);

  // Auto-detect best chart type
  const detectedType = detectChartType(salesData);
  console.log('Detected chart type:', detectedType);

  console.log('\n');
}

// ============================================================================
// EXAMPLE 2: Parse and Analyze CSV File
// ============================================================================

export async function example2_ParseCSVFile(file: File) {
  console.log('=== Example 2: Parse and Analyze CSV File ===\n');

  try {
    // Parse CSV
    const dataTable = await parseCSV(file);
    console.log(`Parsed ${dataTable.rowCount} rows with ${dataTable.columnCount} columns`);
    console.log('Headers:', dataTable.headers.join(', '));

    // Detect column types
    const columnTypes = detectDataTypes(dataTable);
    console.log('\nColumn Types:');
    columnTypes.columns.forEach(col => {
      console.log(`  ${col.name}: ${col.type} (${col.uniqueCount} unique, ${col.nullCount} nulls)`);
      console.log(`    Samples:`, col.sampleValues.slice(0, 3).join(', '));
    });

    // Generate statistics
    const stats = generateSummaryStats(dataTable);
    console.log(`\nData Completeness: ${stats.summary.completeness.toFixed(2)}%`);
    console.log(`Total Cells: ${stats.summary.totalCells}`);
    console.log(`Total Nulls: ${stats.summary.totalNulls}`);

    console.log('\nColumn Statistics:');
    stats.columns.forEach(col => {
      console.log(`  ${col.name}:`);
      console.log(`    Type: ${col.type}`);
      console.log(`    Count: ${col.count}`);
      console.log(`    Unique: ${col.uniqueCount}`);

      if (col.mean !== undefined) {
        console.log(`    Mean: ${col.mean.toFixed(2)}`);
        console.log(`    Median: ${col.median?.toFixed(2)}`);
        console.log(`    Min: ${col.min}, Max: ${col.max}`);
        console.log(`    Std Dev: ${col.stdDev?.toFixed(2)}`);
      }

      console.log(`    Mode: ${col.mode}`);
    });

    console.log('\n');
    return { dataTable, stats, columnTypes };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Multi-Format Data Parsing
// ============================================================================

export async function example3_MultiFormatParsing(files: File[]) {
  console.log('=== Example 3: Multi-Format Data Parsing ===\n');

  for (const file of files) {
    try {
      console.log(`Processing: ${file.name}`);

      // Auto-detect and parse file
      const dataTable = await parseFile(file);
      console.log(`  ✓ Parsed ${dataTable.rowCount} rows × ${dataTable.columnCount} columns`);

      // Quick stats
      const stats = generateSummaryStats(dataTable);
      console.log(`  ✓ Completeness: ${stats.summary.completeness.toFixed(1)}%`);
      console.log(`  ✓ File size: ${(file.size / 1024).toFixed(2)} KB\n`);
    } catch (error) {
      console.error(`  ✗ Failed to parse ${file.name}:`, error);
    }
  }

  console.log('\n');
}

// ============================================================================
// EXAMPLE 4: Create Visualization from Data
// ============================================================================

export async function example4_CreateVisualization(file: File) {
  console.log('=== Example 4: Create Visualization from Data ===\n');

  try {
    // Complete workflow: parse → analyze → visualize
    const result = await createVisualizationWorkflow(file, 'bar', {
      title: 'Data Analysis',
      xLabel: 'Category',
      yLabel: 'Value',
    });

    console.log('Workflow Results:');
    console.log(`  Chart Type: ${result.chartType}`);
    console.log(`  Data Points: ${result.dataTable.rowCount}`);
    console.log(`  Completeness: ${result.stats.summary.completeness}%`);

    console.log('\nColumn Types:');
    result.columnTypes.columns.forEach(col => {
      console.log(`  ${col.name}: ${col.type}`);
    });

    console.log('\nChart Configuration:');
    console.log(`  Type: ${result.chart.type}`);
    console.log(`  Datasets: ${result.chart.data.datasets.length}`);

    console.log('\n');
    return result;
  } catch (error) {
    console.error('Error creating visualization:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 5: Export Chat Conversation to PDF
// ============================================================================

export async function example5_ExportChatToPDF() {
  console.log('=== Example 5: Export Chat Conversation to PDF ===\n');

  // Sample chat messages
  const messages: DVChatMessage[] = [
    {
      role: 'user',
      content: 'Can you analyze this sales data and create a visualization?',
      timestamp: new Date('2024-01-15T10:30:00'),
    },
    {
      role: 'assistant',
      content: 'I\'ll analyze your sales data. I can see quarterly trends showing strong growth in Q3.',
      timestamp: new Date('2024-01-15T10:30:15'),
    },
    {
      role: 'user',
      content: 'What are the key insights?',
      timestamp: new Date('2024-01-15T10:31:00'),
    },
    {
      role: 'assistant',
      content: 'Key insights: 1) Q3 revenue increased 17% YoY, 2) Product A leads with 45% market share, 3) Regional expansion drove 30% of growth.',
      timestamp: new Date('2024-01-15T10:31:30'),
    },
  ];

  // Sample charts (in real usage, these would be actual chart canvases)
  const charts: DVChartData[] = [
    {
      type: 'bar',
      title: 'Quarterly Sales Performance',
      description: 'Revenue by quarter showing consistent growth',
      insights: [
        'Q3 showed strongest performance with $61K revenue',
        'Average quarterly revenue: $54K',
        'Consistent upward trend throughout the year',
      ],
      statistics: {
        totalRevenue: '$216,000',
        averageQuarterly: '$54,000',
        growth: '+17%',
      },
      // In real usage: canvas: document.getElementById('chart1') as HTMLCanvasElement
    },
    {
      type: 'pie',
      title: 'Market Share by Product',
      description: 'Product distribution across portfolio',
      insights: [
        'Product A dominates with 45% market share',
        'Products B and C combined: 40% share',
        'Product D shows potential for growth at 15%',
      ],
      statistics: {
        totalProducts: '4',
        leadingProduct: 'Product A (45%)',
        combinedTop2: '70%',
      },
    },
  ];

  try {
    await exportChatToPDF(messages, charts, 'sales-analysis-report', {
      title: 'Q4 2024 Sales Analysis Report',
      author: 'Data Analytics Team',
      companyName: 'Acme Corporation',
      includeTimestamps: true,
      includeTableOfContents: true,
      includePageNumbers: true,
      includeHeader: true,
      includeFooter: true,
    });

    console.log('✓ PDF exported successfully: sales-analysis-report.pdf');
    console.log(`  Messages: ${messages.length}`);
    console.log(`  Charts: ${charts.length}`);
    console.log('\n');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 6: Export Data Table to PDF
// ============================================================================

export async function example6_ExportTableToPDF() {
  console.log('=== Example 6: Export Data Table to PDF ===\n');

  const headers = ['Product', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'];
  const rows = [
    ['Product A', '$15,000', '$18,000', '$22,000', '$20,000', '$75,000'],
    ['Product B', '$12,000', '$14,000', '$16,000', '$15,000', '$57,000'],
    ['Product C', '$10,000', '$12,000', '$14,000', '$13,000', '$49,000'],
    ['Product D', '$8,000', '$8,000', '$9,000', '$10,000', '$35,000'],
  ];

  try {
    await exportTableToPDF(
      'Product Sales by Quarter',
      headers,
      rows,
      'product-sales-table',
      {
        author: 'Sales Team',
        includePageNumbers: true,
      }
    );

    console.log('✓ Table PDF exported successfully: product-sales-table.pdf');
    console.log(`  Rows: ${rows.length}`);
    console.log(`  Columns: ${headers.length}`);
    console.log('\n');
  } catch (error) {
    console.error('Error exporting table PDF:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 7: Export to PowerPoint Presentation
// ============================================================================

export async function example7_ExportToPowerPoint() {
  console.log('=== Example 7: Export to PowerPoint Presentation ===\n');

  const messages: DVChatMessage[] = [
    {
      role: 'assistant',
      content: 'Analysis reveals strong performance across all metrics with Q3 leading growth.',
    },
  ];

  const charts: DVChartData[] = [
    {
      type: 'line',
      title: 'Revenue Trend Analysis',
      description: 'Monthly revenue showing consistent growth',
      insights: [
        'Revenue increased 25% from Jan to Dec',
        'Average monthly growth: 2.1%',
        'Peak performance in November',
      ],
      statistics: {
        annualRevenue: '$648,000',
        averageMonthly: '$54,000',
        growthRate: '+25%',
      },
    },
    {
      type: 'bar',
      title: 'Regional Performance',
      description: 'Sales by geographical region',
      insights: [
        'North America leads with $250K revenue',
        'APAC shows fastest growth at 30% YoY',
        'Europe maintains stable 20% market share',
      ],
      statistics: {
        topRegion: 'North America',
        fastestGrowth: 'APAC (+30%)',
        totalRegions: '4',
      },
    },
  ];

  try {
    await exportChatToPPT(messages, charts, 'sales-presentation', {
      title: 'Q4 2024 Performance Review',
      subtitle: 'Sales & Marketing Analysis',
      author: 'Analytics Team',
      company: 'Acme Corporation',
      theme: 'blue',
      includeSpeakerNotes: true,
      includeDataTables: true,
    });

    console.log('✓ PowerPoint exported successfully: sales-presentation.pptx');
    console.log(`  Slides: ${2 + charts.length + (charts.length * 2)}`); // Title + Agenda + Charts + Data tables
    console.log(`  Theme: blue`);
    console.log('\n');
  } catch (error) {
    console.error('Error exporting PowerPoint:', error);
    throw error;
  }
}

// ============================================================================
// EXAMPLE 8: Quick Export Workflows
// ============================================================================

export async function example8_QuickExportWorkflows(file: File) {
  console.log('=== Example 8: Quick Export Workflows ===\n');

  // Quick PDF export
  console.log('Creating quick PDF export...');
  try {
    await quickExportToPDF(file, 'quick-report', {
      chartTitle: 'Data Visualization',
      chartType: 'bar',
      pdfTitle: 'Quick Analysis Report',
      pdfAuthor: 'Analytics Bot',
    });
    console.log('✓ Quick PDF created: quick-report.pdf\n');
  } catch (error) {
    console.error('Error in quick PDF export:', error);
  }

  // Quick PowerPoint export
  console.log('Creating quick PowerPoint export...');
  try {
    await quickExportToPPT(file, 'quick-presentation', {
      chartTitle: 'Data Analysis',
      pptTitle: 'Quick Presentation',
      pptSubtitle: 'Generated from data',
      theme: 'green',
    });
    console.log('✓ Quick PowerPoint created: quick-presentation.pptx\n');
  } catch (error) {
    console.error('Error in quick PowerPoint export:', error);
  }

  console.log('\n');
}

// ============================================================================
// EXAMPLE 9: Batch Processing Multiple Files
// ============================================================================

export async function example9_BatchProcessing(files: File[]) {
  console.log('=== Example 9: Batch Processing Multiple Files ===\n');

  console.log(`Processing ${files.length} files...\n`);

  const results = await batchProcessFiles(files);

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('Batch Processing Results:');
  console.log(`  Total: ${results.length}`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Failed: ${failed}\n`);

  // Details
  results.forEach(result => {
    if (result.success) {
      console.log(`✓ ${result.filename}`);
      console.log(`  Rows: ${result.stats?.rowCount}`);
      console.log(`  Columns: ${result.stats?.columnCount}`);
      console.log(`  Completeness: ${result.stats?.summary.completeness.toFixed(1)}%`);
    } else {
      console.log(`✗ ${result.filename}`);
      console.log(`  Error: ${result.error}`);
    }
    console.log('');
  });

  console.log('\n');
  return results;
}

// ============================================================================
// EXAMPLE 10: Advanced Chart Customization
// ============================================================================

export async function example10_AdvancedChartCustomization() {
  console.log('=== Example 10: Advanced Chart Customization ===\n');

  // Custom color schemes
  const customColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  // Multi-dataset line chart
  const multiLineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Product A',
        data: [30, 35, 40, 45, 50, 55],
      },
      {
        label: 'Product B',
        data: [25, 28, 32, 35, 38, 42],
      },
      {
        label: 'Product C',
        data: [20, 22, 25, 28, 30, 33],
      },
    ],
  };

  const multiLineChart = generateLineChart([multiLineData], {
    title: 'Product Performance Comparison',
    xLabel: 'Month',
    yLabel: 'Sales (thousands)',
    colors: customColors,
    showLegend: true,
    showGrid: true,
    animation: true,
  });

  console.log('Multi-dataset line chart created');
  console.log(`  Datasets: ${multiLineChart.data.datasets.length}`);
  console.log(`  Data points per dataset: ${multiLineData.datasets[0].data.length}`);

  // Radar chart for performance metrics
  const radarData = [
    { label: 'Speed', value: 85 },
    { label: 'Quality', value: 90 },
    { label: 'Reliability', value: 75 },
    { label: 'Cost', value: 60 },
    { label: 'Support', value: 80 },
  ];

  const radarChart = generateRadarChart(radarData, {
    title: 'Performance Metrics',
    colors: ['#3b82f6'],
  });

  console.log('Radar chart created');
  console.log(`  Metrics: ${radarData.length}`);

  // Scatter plot for correlation
  const scatterData = [
    { x: 10, y: 20 },
    { x: 15, y: 25 },
    { x: 20, y: 30 },
    { x: 25, y: 28 },
    { x: 30, y: 35 },
  ];

  const scatterChart = generateScatterChart(scatterData, {
    title: 'Price vs Demand Correlation',
    xLabel: 'Price ($)',
    yLabel: 'Units Sold',
  });

  console.log('Scatter chart created');
  console.log(`  Data points: ${scatterData.length}`);

  console.log('\n');
}

// ============================================================================
// MAIN DEMO RUNNER
// ============================================================================

export async function runAllExamples() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Data Visualization Agent - Complete Examples Demo       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Run synchronous examples
  await example1_BasicChartGeneration();
  await example10_AdvancedChartCustomization();

  // Examples that need files would be run based on user input
  console.log('File-based examples require actual file inputs:');
  console.log('  - example2_ParseCSVFile(file)');
  console.log('  - example3_MultiFormatParsing([file1, file2, file3])');
  console.log('  - example4_CreateVisualization(file)');
  console.log('  - example8_QuickExportWorkflows(file)');
  console.log('  - example9_BatchProcessing([file1, file2])');
  console.log('\n');

  // Run export examples
  await example5_ExportChatToPDF();
  await example6_ExportTableToPDF();
  await example7_ExportToPowerPoint();

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   All examples completed successfully!                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

// Export individual examples
export default {
  example1_BasicChartGeneration,
  example2_ParseCSVFile,
  example3_MultiFormatParsing,
  example4_CreateVisualization,
  example5_ExportChatToPDF,
  example6_ExportTableToPDF,
  example7_ExportToPowerPoint,
  example8_QuickExportWorkflows,
  example9_BatchProcessing,
  example10_AdvancedChartCustomization,
  runAllExamples,
};
