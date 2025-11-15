import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool definitions for data analysis
const DATA_ANALYSIS_TOOLS: Anthropic.Tool[] = [
  {
    name: 'analyze_data_statistics',
    description: 'Calculate statistical metrics (mean, median, mode, standard deviation, min, max) for numeric columns in the dataset',
    input_schema: {
      type: 'object',
      properties: {
        columns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of column names to analyze',
        },
      },
      required: ['columns'],
    },
  },
  {
    name: 'identify_data_patterns',
    description: 'Identify patterns in the data such as trends, correlations, seasonality, or anomalies',
    input_schema: {
      type: 'object',
      properties: {
        pattern_type: {
          type: 'string',
          enum: ['trend', 'correlation', 'anomaly', 'seasonality'],
          description: 'Type of pattern to identify',
        },
        columns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Columns to analyze for patterns',
        },
      },
      required: ['pattern_type'],
    },
  },
  {
    name: 'suggest_visualizations',
    description: 'Recommend appropriate chart types based on the data structure and analysis goals',
    input_schema: {
      type: 'object',
      properties: {
        data_summary: {
          type: 'object',
          description: 'Summary of data structure including column types and relationships',
        },
        analysis_goal: {
          type: 'string',
          description: 'What the user wants to understand from the data',
        },
      },
      required: ['data_summary'],
    },
  },
  {
    name: 'generate_chart_config',
    description: 'Generate a Chart.js configuration object for a specific visualization',
    input_schema: {
      type: 'object',
      properties: {
        chart_type: {
          type: 'string',
          enum: ['bar', 'line', 'pie', 'doughnut', 'scatter', 'bubble', 'radar', 'polarArea'],
          description: 'Type of chart to generate',
        },
        x_column: {
          type: 'string',
          description: 'Column name for X-axis data',
        },
        y_column: {
          type: 'string',
          description: 'Column name for Y-axis data',
        },
        title: {
          type: 'string',
          description: 'Chart title',
        },
        options: {
          type: 'object',
          description: 'Additional chart options (colors, labels, etc.)',
        },
      },
      required: ['chart_type', 'x_column', 'y_column', 'title'],
    },
  },
];

// Parse uploaded file data
async function parseFileData(file: File): Promise<{ headers: string[]; rows: any[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileType = file.name.split('.').pop()?.toLowerCase();

  if (fileType === 'csv') {
    // Parse CSV
    const text = buffer.toString('utf-8');
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    return {
      headers: parsed.meta.fields || [],
      rows: parsed.data,
    };
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];
    const headers = jsonData.length > 0 ? Object.keys(jsonData[0] as object) : [];
    return {
      headers,
      rows: jsonData,
    };
  } else if (fileType === 'json') {
    // Parse JSON
    const text = buffer.toString('utf-8');
    const jsonData = JSON.parse(text);
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    const headers = dataArray.length > 0 ? Object.keys(dataArray[0] as object) : [];
    return {
      headers,
      rows: dataArray,
    };
  } else {
    throw new Error('Unsupported file format. Please upload CSV, Excel, or JSON files.');
  }
}

// Execute tool based on tool name and input
function executeTool(
  toolName: string,
  toolInput: any,
  data: { headers: string[]; rows: any[] }
): any {
  switch (toolName) {
    case 'analyze_data_statistics': {
      const { columns } = toolInput;
      const stats: Record<string, any> = {};

      for (const column of columns) {
        const values = data.rows
          .map(row => parseFloat(row[column]))
          .filter(val => !isNaN(val));

        if (values.length === 0) {
          stats[column] = { error: 'No numeric values found' };
          continue;
        }

        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        stats[column] = {
          count: values.length,
          mean: parseFloat(mean.toFixed(2)),
          median: parseFloat(median.toFixed(2)),
          min: Math.min(...values),
          max: Math.max(...values),
          stdDev: parseFloat(stdDev.toFixed(2)),
        };
      }

      return stats;
    }

    case 'identify_data_patterns': {
      const { pattern_type, columns } = toolInput;
      const results: any = { pattern_type, findings: [] };

      if (pattern_type === 'trend' && columns && columns.length >= 2) {
        // Simple trend analysis for the first two columns
        const xCol = columns[0];
        const yCol = columns[1];
        const values = data.rows.map(row => ({
          x: row[xCol],
          y: parseFloat(row[yCol]),
        })).filter(item => !isNaN(item.y));

        if (values.length > 1) {
          const firstHalf = values.slice(0, Math.floor(values.length / 2));
          const secondHalf = values.slice(Math.floor(values.length / 2));
          const firstAvg = firstHalf.reduce((sum, v) => sum + v.y, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, v) => sum + v.y, 0) / secondHalf.length;
          const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;

          results.findings.push({
            type: 'trend',
            columns: [xCol, yCol],
            direction: percentChange > 5 ? 'upward' : percentChange < -5 ? 'downward' : 'stable',
            change_percent: parseFloat(percentChange.toFixed(2)),
          });
        }
      } else if (pattern_type === 'correlation' && columns && columns.length >= 2) {
        // Calculate correlation between numeric columns
        const correlations: any[] = [];
        for (let i = 0; i < columns.length - 1; i++) {
          for (let j = i + 1; j < columns.length; j++) {
            const col1 = columns[i];
            const col2 = columns[j];
            const pairs = data.rows.map(row => ({
              x: parseFloat(row[col1]),
              y: parseFloat(row[col2]),
            })).filter(pair => !isNaN(pair.x) && !isNaN(pair.y));

            if (pairs.length > 1) {
              const xMean = pairs.reduce((sum, p) => sum + p.x, 0) / pairs.length;
              const yMean = pairs.reduce((sum, p) => sum + p.y, 0) / pairs.length;
              const numerator = pairs.reduce((sum, p) => sum + (p.x - xMean) * (p.y - yMean), 0);
              const denomX = Math.sqrt(pairs.reduce((sum, p) => sum + Math.pow(p.x - xMean, 2), 0));
              const denomY = Math.sqrt(pairs.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0));
              const correlation = numerator / (denomX * denomY);

              correlations.push({
                columns: [col1, col2],
                coefficient: parseFloat(correlation.toFixed(3)),
                strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak',
              });
            }
          }
        }
        results.findings = correlations;
      } else if (pattern_type === 'anomaly') {
        // Detect outliers using IQR method
        const anomalies: any[] = [];
        const numericColumns = columns || data.headers.filter(col => {
          const sample = data.rows.find(row => row[col] !== null && row[col] !== undefined);
          return sample && !isNaN(parseFloat(sample[col]));
        });

        for (const column of numericColumns) {
          const values = data.rows
            .map(row => parseFloat(row[column]))
            .filter(val => !isNaN(val))
            .sort((a, b) => a - b);

          if (values.length > 3) {
            const q1Index = Math.floor(values.length * 0.25);
            const q3Index = Math.floor(values.length * 0.75);
            const q1 = values[q1Index];
            const q3 = values[q3Index];
            const iqr = q3 - q1;
            const lowerBound = q1 - 1.5 * iqr;
            const upperBound = q3 + 1.5 * iqr;

            const outliers = data.rows
              .map((row, idx) => ({ value: parseFloat(row[column]), index: idx }))
              .filter(item => !isNaN(item.value) && (item.value < lowerBound || item.value > upperBound));

            if (outliers.length > 0) {
              anomalies.push({
                column,
                count: outliers.length,
                outliers: outliers.slice(0, 5).map(o => ({ index: o.index, value: o.value })),
                bounds: { lower: lowerBound, upper: upperBound },
              });
            }
          }
        }
        results.findings = anomalies;
      }

      return results;
    }

    case 'suggest_visualizations': {
      const { data_summary, analysis_goal } = toolInput;
      const suggestions: any[] = [];

      // Analyze data structure
      const numericCols = data.headers.filter(col => {
        const sample = data.rows.find(row => row[col] !== null && row[col] !== undefined);
        return sample && !isNaN(parseFloat(sample[col]));
      });

      const categoricalCols = data.headers.filter(col => !numericCols.includes(col));

      // Suggest visualizations based on data structure
      if (categoricalCols.length > 0 && numericCols.length > 0) {
        suggestions.push({
          chart_type: 'bar',
          description: 'Bar chart to compare numeric values across categories',
          recommended_for: 'Comparing values across different categories',
          x_column: categoricalCols[0],
          y_column: numericCols[0],
        });
      }

      if (numericCols.length >= 2) {
        suggestions.push({
          chart_type: 'line',
          description: 'Line chart to show trends over time or continuous data',
          recommended_for: 'Showing trends and changes over time',
          x_column: data.headers[0],
          y_column: numericCols[0],
        });

        suggestions.push({
          chart_type: 'scatter',
          description: 'Scatter plot to visualize relationships between two numeric variables',
          recommended_for: 'Identifying correlations and patterns',
          x_column: numericCols[0],
          y_column: numericCols[1],
        });
      }

      if (categoricalCols.length > 0 && data.rows.length <= 10) {
        suggestions.push({
          chart_type: 'pie',
          description: 'Pie chart to show proportional distribution',
          recommended_for: 'Showing parts of a whole',
          x_column: categoricalCols[0],
          y_column: numericCols[0] || 'count',
        });
      }

      return {
        total_rows: data.rows.length,
        numeric_columns: numericCols,
        categorical_columns: categoricalCols,
        suggestions,
      };
    }

    case 'generate_chart_config': {
      const { chart_type, x_column, y_column, title, options = {} } = toolInput;

      // Extract data for the chart
      let chartData: any;
      let chartLabels: string[];

      if (chart_type === 'pie' || chart_type === 'doughnut' || chart_type === 'polarArea') {
        // Aggregate data for pie charts
        const aggregated = new Map<string, number>();
        data.rows.forEach(row => {
          const key = String(row[x_column]);
          const value = parseFloat(row[y_column]) || 1;
          aggregated.set(key, (aggregated.get(key) || 0) + value);
        });

        chartLabels = Array.from(aggregated.keys());
        chartData = Array.from(aggregated.values());
      } else if (chart_type === 'scatter' || chart_type === 'bubble') {
        // Point data for scatter plots
        chartData = data.rows
          .map(row => ({
            x: parseFloat(row[x_column]),
            y: parseFloat(row[y_column]),
          }))
          .filter(point => !isNaN(point.x) && !isNaN(point.y));
        chartLabels = [];
      } else {
        // Line/bar charts
        chartLabels = data.rows.map(row => String(row[x_column]));
        chartData = data.rows.map(row => parseFloat(row[y_column]) || 0);
      }

      // Generate colors
      const colors = [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(249, 115, 22, 0.8)',   // Orange
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(168, 85, 247, 0.8)',   // Purple
        'rgba(236, 72, 153, 0.8)',   // Pink
        'rgba(14, 165, 233, 0.8)',   // Cyan
        'rgba(251, 191, 36, 0.8)',   // Yellow
      ];

      // Build Chart.js config
      const config: any = {
        type: chart_type,
        data: {},
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title,
              font: { size: 16, weight: 'bold' },
            },
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              enabled: true,
            },
          },
          ...options,
        },
      };

      if (chart_type === 'pie' || chart_type === 'doughnut' || chart_type === 'polarArea') {
        config.data = {
          labels: chartLabels,
          datasets: [{
            label: y_column,
            data: chartData,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace('0.8', '1')),
            borderWidth: 2,
          }],
        };
      } else if (chart_type === 'scatter' || chart_type === 'bubble') {
        config.data = {
          datasets: [{
            label: `${x_column} vs ${y_column}`,
            data: chartData,
            backgroundColor: colors[0],
            borderColor: colors[0].replace('0.8', '1'),
            borderWidth: 2,
          }],
        };
        config.options.scales = {
          x: {
            type: 'linear',
            position: 'bottom',
            title: { display: true, text: x_column },
          },
          y: {
            title: { display: true, text: y_column },
          },
        };
      } else {
        config.data = {
          labels: chartLabels,
          datasets: [{
            label: y_column,
            data: chartData,
            backgroundColor: chart_type === 'line' ? 'rgba(59, 130, 246, 0.1)' : colors[0],
            borderColor: colors[0].replace('0.8', '1'),
            borderWidth: 2,
            fill: chart_type === 'line',
            tension: 0.4,
          }],
        };
        if (chart_type !== 'radar') {
          config.options.scales = {
            x: { title: { display: true, text: x_column } },
            y: {
              title: { display: true, text: y_column },
              beginAtZero: true,
            },
          };
        }
      }

      return config;
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`)
        );
      };

      try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const message = formData.get('message') as string;

        if (!file) {
          sendEvent('error', { message: 'No file uploaded' });
          controller.close();
          return;
        }

        // Parse the uploaded file
        sendEvent('thinking', { content: 'Parsing your data file...' });
        const parsedData = await parseFileData(file);

        if (parsedData.rows.length === 0) {
          sendEvent('error', { message: 'No data found in the uploaded file' });
          controller.close();
          return;
        }

        sendEvent('thinking', {
          content: `Parsed ${parsedData.rows.length} rows with ${parsedData.headers.length} columns: ${parsedData.headers.join(', ')}`,
        });

        // Prepare data summary for Claude
        const dataSummary = {
          row_count: parsedData.rows.length,
          columns: parsedData.headers,
          sample_rows: parsedData.rows.slice(0, 5),
        };

        // Create initial prompt with extended thinking
        const systemPrompt = `You are a data visualization expert. You have access to tools for analyzing data and generating visualizations.

The user has uploaded a dataset with ${parsedData.rows.length} rows and the following columns: ${parsedData.headers.join(', ')}.

Here's a sample of the data:
${JSON.stringify(parsedData.rows.slice(0, 5), null, 2)}

Use the available tools to:
1. Analyze the data structure and calculate relevant statistics
2. Identify patterns, trends, or anomalies
3. Suggest appropriate visualizations
4. Generate Chart.js configurations for recommended charts

Think carefully about what insights would be most valuable for this dataset.`;

        const userPrompt = message || 'Analyze this data and create meaningful visualizations.';

        // Call Claude API
        let conversationMessages: Anthropic.MessageParam[] = [
          { role: 'user', content: userPrompt },
        ];

        let continueConversation = true;
        let iterationCount = 0;
        const MAX_ITERATIONS = 10;

        sendEvent('thinking', { content: 'Analyzing your data with AI...' });

        while (continueConversation && iterationCount < MAX_ITERATIONS) {
          iterationCount++;

          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            messages: conversationMessages,
            tools: DATA_ANALYSIS_TOOLS,
          });

          conversationMessages.push({
            role: 'assistant',
            content: response.content,
          });

          continueConversation = false;

          for (const block of response.content) {
            if (block.type === 'text') {
              sendEvent('text', { content: block.text });
            } else if (block.type === 'tool_use') {
              sendEvent('tool_use', {
                toolName: block.name,
                input: block.input,
              });

              // Execute the tool
              const toolResult = executeTool(block.name, block.input, parsedData);

              sendEvent('tool_result', {
                toolName: block.name,
                result: toolResult,
              });

              // If tool generated a chart config, send it
              if (block.name === 'generate_chart_config' && !toolResult.error) {
                sendEvent('chart', { config: toolResult });
              }

              // Continue conversation with tool results
              conversationMessages.push({
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: block.id,
                    content: JSON.stringify(toolResult),
                  },
                ],
              });

              continueConversation = true;
            }
          }
        }

        sendEvent('done', {});
        controller.close();
      } catch (error: any) {
        console.error('[Data Viz Error]:', error);
        sendEvent('error', {
          message: error.message || 'An error occurred while processing your data',
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
