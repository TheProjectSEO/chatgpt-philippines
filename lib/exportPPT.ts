/**
 * PowerPoint Export Utility
 *
 * Exports chat conversations and visualizations to professionally formatted
 * PowerPoint presentations using pptxgenjs.
 *
 * @module exportPPT
 */

import pptxgen from 'pptxgenjs';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date | string;
}

/**
 * Chart data for PowerPoint export
 */
export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'radar';
  title: string;
  description?: string;
  data?: any[];
  labels?: string[];
  datasets?: any[];
  canvas?: HTMLCanvasElement;
  element?: HTMLElement;
  imageData?: string;
  insights?: string[];
  statistics?: Record<string, any>;
}

/**
 * PowerPoint export options
 */
export interface PPTExportOptions {
  title?: string;
  subtitle?: string;
  author?: string;
  company?: string;
  subject?: string;
  theme?: 'default' | 'dark' | 'blue' | 'green';
  includeTimestamps?: boolean;
  includeSpeakerNotes?: boolean;
  includeDataTables?: boolean;
  logo?: string;
}

/**
 * PowerPoint theme colors
 */
const THEMES = {
  default: {
    primary: '3B82F6',
    secondary: '64748B',
    accent: '10B981',
    background: 'FFFFFF',
    text: '1E293B',
    lightGray: 'F1F5F9',
  },
  dark: {
    primary: '60A5FA',
    secondary: '94A3B8',
    accent: '34D399',
    background: '0F172A',
    text: 'F8FAFC',
    lightGray: '334155',
  },
  blue: {
    primary: '2563EB',
    secondary: '475569',
    accent: '0EA5E9',
    background: 'FFFFFF',
    text: '0F172A',
    lightGray: 'E0F2FE',
  },
  green: {
    primary: '059669',
    secondary: '475569',
    accent: '10B981',
    background: 'FFFFFF',
    text: '064E3B',
    lightGray: 'D1FAE5',
  },
};

/**
 * Capture chart as image from canvas element
 */
async function captureChartImage(canvas: HTMLCanvasElement): Promise<string> {
  try {
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture chart from canvas:', error);
    throw new Error('Failed to capture chart image');
  }
}

/**
 * Capture chart as image from HTML element (using html2canvas)
 */
async function captureElementImage(element: HTMLElement): Promise<string> {
  try {
    // Dynamically import html2canvas to avoid issues
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture chart from element:', error);
    throw new Error('Failed to capture chart image');
  }
}

/**
 * Create title slide
 */
function createTitleSlide(
  pptx: pptxgen,
  options: PPTExportOptions,
  theme: typeof THEMES.default
): void {
  const slide = pptx.addSlide();

  // Background
  slide.background = { color: theme.background };

  // Logo
  if (options.logo) {
    try {
      slide.addImage({
        data: options.logo,
        x: 0.5,
        y: 0.5,
        w: 1.5,
        h: 0.5,
      });
    } catch (error) {
      console.warn('Failed to add logo to title slide:', error);
    }
  }

  // Title
  slide.addText(options.title || 'Data Analysis Presentation', {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: theme.primary,
    align: 'center',
  });

  // Subtitle
  if (options.subtitle) {
    slide.addText(options.subtitle, {
      x: 0.5,
      y: 3.7,
      w: 9,
      h: 0.5,
      fontSize: 24,
      color: theme.secondary,
      align: 'center',
    });
  }

  // Author and date
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const authorText = options.author
    ? `${options.author} | ${date}`
    : date;

  slide.addText(authorText, {
    x: 0.5,
    y: 5.0,
    w: 9,
    h: 0.3,
    fontSize: 14,
    color: theme.secondary,
    align: 'center',
  });

  // Company
  if (options.company) {
    slide.addText(options.company, {
      x: 0.5,
      y: 5.4,
      w: 9,
      h: 0.3,
      fontSize: 12,
      color: theme.secondary,
      align: 'center',
    });
  }
}

/**
 * Create agenda/table of contents slide
 */
function createAgendaSlide(
  pptx: pptxgen,
  charts: ChartData[],
  theme: typeof THEMES.default
): void {
  const slide = pptx.addSlide();
  slide.background = { color: theme.background };

  // Title
  slide.addText('Agenda', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: theme.primary,
  });

  // Agenda items
  const items = [
    'Overview & Key Insights',
    ...charts.map((chart, index) => `${index + 1}. ${chart.title}`),
    'Summary & Recommendations',
  ];

  const startY = 1.5;
  const itemHeight = 0.5;

  items.forEach((item, index) => {
    slide.addText(item, {
      x: 1,
      y: startY + index * itemHeight,
      w: 8,
      h: itemHeight,
      fontSize: 18,
      color: theme.text,
      bullet: { type: 'number' },
    });
  });
}

/**
 * Create summary slide from chat messages
 */
function createSummarySlide(
  pptx: pptxgen,
  messages: ChatMessage[],
  theme: typeof THEMES.default,
  options: PPTExportOptions
): void {
  const slide = pptx.addSlide();
  slide.background = { color: theme.background };

  // Title
  slide.addText('Key Insights & Summary', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: theme.primary,
  });

  // Extract key points from assistant messages
  const assistantMessages = messages.filter((msg) => msg.role === 'assistant');
  const keyPoints = assistantMessages
    .slice(-5) // Last 5 assistant messages
    .map((msg) => {
      // Extract first sentence or limit to 200 chars
      const content = msg.content.split(/[.!?]/)[0].trim();
      return content.length > 200 ? content.substring(0, 200) + '...' : content;
    })
    .filter((point) => point.length > 0);

  const startY = 1.5;
  const itemHeight = 0.7;

  keyPoints.forEach((point, index) => {
    slide.addText(point, {
      x: 1,
      y: startY + index * itemHeight,
      w: 8,
      h: itemHeight,
      fontSize: 14,
      color: theme.text,
      bullet: true,
      valign: 'top',
    });
  });

  // Add speaker notes with full chat history
  if (options.includeSpeakerNotes && messages.length > 0) {
    const notes = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    slide.addNotes(notes.substring(0, 5000)); // PowerPoint notes limit
  }
}

/**
 * Create chart slide
 */
async function createChartSlide(
  pptx: pptxgen,
  chart: ChartData,
  theme: typeof THEMES.default,
  options: PPTExportOptions
): Promise<void> {
  const slide = pptx.addSlide();
  slide.background = { color: theme.background };

  // Title
  slide.addText(chart.title, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: theme.primary,
  });

  // Description
  if (chart.description) {
    slide.addText(chart.description, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 0.4,
      fontSize: 14,
      color: theme.secondary,
    });
  }

  // Get chart image
  let imageData: string | undefined;

  if (chart.imageData) {
    imageData = chart.imageData;
  } else if (chart.canvas) {
    imageData = await captureChartImage(chart.canvas);
  } else if (chart.element) {
    imageData = await captureElementImage(chart.element);
  }

  // Add chart image
  if (imageData) {
    slide.addImage({
      data: imageData,
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 4.5,
      sizing: {
        type: 'contain',
        w: 9,
        h: 4.5,
      },
    });
  }

  // Add insights if available
  if (chart.insights && chart.insights.length > 0) {
    const insightY = 6.5;
    chart.insights.slice(0, 2).forEach((insight, index) => {
      slide.addText(insight, {
        x: 0.7,
        y: insightY + index * 0.4,
        w: 8.6,
        h: 0.35,
        fontSize: 11,
        color: theme.text,
        bullet: true,
      });
    });
  }

  // Add speaker notes with insights and statistics
  if (options.includeSpeakerNotes) {
    let notes = chart.description || '';

    if (chart.insights) {
      notes += '\n\nKey Insights:\n' + chart.insights.join('\n');
    }

    if (chart.statistics) {
      notes += '\n\nStatistics:\n';
      Object.entries(chart.statistics).forEach(([key, value]) => {
        notes += `${key}: ${value}\n`;
      });
    }

    if (notes.length > 0) {
      slide.addNotes(notes.substring(0, 5000));
    }
  }
}

/**
 * Create data table slide
 */
function createDataTableSlide(
  pptx: pptxgen,
  chart: ChartData,
  theme: typeof THEMES.default
): void {
  const slide = pptx.addSlide();
  slide.background = { color: theme.background };

  // Title
  slide.addText(`${chart.title} - Data Table`, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: theme.primary,
  });

  // Prepare table data
  if (!chart.labels || !chart.data) {
    slide.addText('No data available for table', {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1,
      fontSize: 16,
      color: theme.secondary,
      align: 'center',
    });
    return;
  }

  const rows: any[][] = [
    [
      {
        text: 'Label',
        options: { bold: true, color: 'FFFFFF', fill: theme.primary },
      },
      {
        text: 'Value',
        options: { bold: true, color: 'FFFFFF', fill: theme.primary },
      },
    ],
  ];

  chart.labels.forEach((label, index) => {
    const value = Array.isArray(chart.data)
      ? chart.data[index]
      : chart.datasets?.[0]?.data?.[index];

    rows.push([
      { text: label, options: { color: theme.text } },
      {
        text: String(value || 0),
        options: { color: theme.text, align: 'right' },
      },
    ]);
  });

  // Add table
  slide.addTable(rows, {
    x: 1,
    y: 1.5,
    w: 8,
    rowH: 0.4,
    fontSize: 12,
    border: { type: 'solid', pt: 1, color: theme.lightGray },
    fill: { color: 'FFFFFF' },
    align: 'left',
    valign: 'middle',
  });
}

/**
 * Create statistics slide
 */
function createStatisticsSlide(
  pptx: pptxgen,
  statistics: Record<string, any>,
  theme: typeof THEMES.default
): void {
  const slide = pptx.addSlide();
  slide.background = { color: theme.background };

  // Title
  slide.addText('Summary Statistics', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: theme.primary,
  });

  // Create statistics grid
  const entries = Object.entries(statistics).slice(0, 8); // Max 8 items
  const itemsPerRow = 2;
  const boxWidth = 4;
  const boxHeight = 1.2;
  const spacing = 0.5;
  const startY = 1.5;

  entries.forEach(([key, value], index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const x = 0.5 + col * (boxWidth + spacing);
    const y = startY + row * (boxHeight + spacing);

    // Background box
    slide.addShape(pptx.ShapeType.rect, {
      x,
      y,
      w: boxWidth,
      h: boxHeight,
      fill: { color: theme.lightGray },
      line: { color: theme.primary, pt: 2 },
    });

    // Stat label
    slide.addText(key.replace(/([A-Z])/g, ' $1').toUpperCase(), {
      x,
      y: y + 0.2,
      w: boxWidth,
      h: 0.4,
      fontSize: 12,
      bold: true,
      color: theme.secondary,
      align: 'center',
    });

    // Stat value
    slide.addText(String(value), {
      x,
      y: y + 0.6,
      w: boxWidth,
      h: 0.5,
      fontSize: 20,
      bold: true,
      color: theme.primary,
      align: 'center',
    });
  });
}

/**
 * Export chat conversation and charts to PowerPoint
 *
 * @param messages - Array of chat messages
 * @param charts - Array of chart data
 * @param filename - Output filename (without .pptx extension)
 * @param options - Export options
 *
 * @example
 * ```typescript
 * await exportChatToPPT(
 *   messages,
 *   charts,
 *   'data-analysis-presentation',
 *   {
 *     title: 'Q4 Sales Analysis',
 *     subtitle: 'Performance Review',
 *     theme: 'blue'
 *   }
 * );
 * ```
 */
export async function exportChatToPPT(
  messages: ChatMessage[],
  charts: ChartData[],
  filename: string,
  options: PPTExportOptions = {}
): Promise<void> {
  try {
    // Create presentation
    const pptx = new pptxgen();

    // Set presentation properties
    pptx.author = options.author || 'ChatGPT Philippines';
    pptx.company = options.company || 'ChatGPT Philippines';
    pptx.subject = options.subject || 'Data Analysis Presentation';
    pptx.title = options.title || 'Data Analysis';

    // Set layout
    pptx.layout = 'LAYOUT_16x9';

    // Get theme
    const theme = THEMES[options.theme || 'default'];

    // 1. Title slide
    createTitleSlide(pptx, options, theme);

    // 2. Agenda slide
    if (charts.length > 0) {
      createAgendaSlide(pptx, charts, theme);
    }

    // 3. Summary slide (from chat messages)
    if (messages.length > 0) {
      createSummarySlide(pptx, messages, theme, options);
    }

    // 4. Chart slides
    for (const chart of charts) {
      await createChartSlide(pptx, chart, theme, options);

      // Add data table slide if requested
      if (options.includeDataTables && chart.labels && chart.data) {
        createDataTableSlide(pptx, chart, theme);
      }
    }

    // 5. Overall statistics slide (if we have chart statistics)
    const allStatistics = charts
      .filter((c) => c.statistics)
      .reduce((acc, c) => ({ ...acc, ...c.statistics }), {});

    if (Object.keys(allStatistics).length > 0) {
      createStatisticsSlide(pptx, allStatistics, theme);
    }

    // Save presentation
    const finalFilename = filename.endsWith('.pptx')
      ? filename
      : `${filename}.pptx`;

    await pptx.writeFile({ fileName: finalFilename });
  } catch (error) {
    console.error('Failed to export PowerPoint:', error);
    throw new Error(
      `Failed to export PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Export single chart to PowerPoint
 *
 * @param chart - Chart data
 * @param filename - Output filename
 * @param options - Export options
 */
export async function exportChartToPPT(
  chart: ChartData,
  filename: string,
  options: PPTExportOptions = {}
): Promise<void> {
  await exportChatToPPT([], [chart], filename, options);
}

/**
 * Export multiple charts to PowerPoint (no chat history)
 *
 * @param charts - Array of chart data
 * @param filename - Output filename
 * @param options - Export options
 */
export async function exportChartsToPPT(
  charts: ChartData[],
  filename: string,
  options: PPTExportOptions = {}
): Promise<void> {
  await exportChatToPPT([], charts, filename, options);
}

/**
 * Create a custom presentation with custom slides
 *
 * @returns pptxgen instance for custom slide creation
 */
export function createCustomPresentation(
  options: PPTExportOptions = {}
): pptxgen {
  const pptx = new pptxgen();

  pptx.author = options.author || 'ChatGPT Philippines';
  pptx.company = options.company || 'ChatGPT Philippines';
  pptx.subject = options.subject || 'Data Analysis Presentation';
  pptx.title = options.title || 'Data Analysis';
  pptx.layout = 'LAYOUT_16x9';

  return pptx;
}

/**
 * Export theme colors for external use
 */
export { THEMES };
