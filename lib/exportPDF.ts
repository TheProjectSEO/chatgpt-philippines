/**
 * PDF Export Utility
 *
 * Exports chat conversations and visualizations to professionally formatted PDF documents
 * using jsPDF and html2canvas for chart rendering.
 *
 * @module exportPDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date | string;
}

/**
 * Chart data for PDF export
 */
export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'radar';
  title: string;
  description?: string;
  canvas?: HTMLCanvasElement;
  element?: HTMLElement;
  imageData?: string;
}

/**
 * PDF export options
 */
export interface PDFExportOptions {
  includeTimestamps?: boolean;
  includeTableOfContents?: boolean;
  includePageNumbers?: boolean;
  includeHeader?: boolean;
  includeFooter?: boolean;
  title?: string;
  author?: string;
  subject?: string;
  companyName?: string;
  logo?: string;
}

/**
 * PDF styling constants
 */
const PDF_STYLES = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    text: '#1e293b',
    lightGray: '#f1f5f9',
    darkGray: '#475569',
    white: '#ffffff',
  },
  fonts: {
    title: 20,
    heading: 16,
    subheading: 14,
    body: 11,
    small: 9,
  },
  margins: {
    page: 20,
    section: 10,
    line: 5,
  },
};

/**
 * Capture chart as image from canvas element
 *
 * @param canvas - Canvas element containing the chart
 * @returns Promise resolving to base64 image data
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
 * Capture chart as image from HTML element
 *
 * @param element - HTML element containing the chart
 * @returns Promise resolving to base64 image data
 */
async function captureElementImage(element: HTMLElement): Promise<string> {
  try {
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
 * Add header to PDF page
 */
function addHeader(
  doc: jsPDF,
  title: string,
  pageWidth: number,
  options: PDFExportOptions
): number {
  let yPos = PDF_STYLES.margins.page;

  // Add logo if provided
  if (options.logo) {
    try {
      doc.addImage(options.logo, 'PNG', PDF_STYLES.margins.page, yPos, 30, 10);
      yPos += 15;
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
    }
  }

  // Add company name
  if (options.companyName) {
    doc.setFontSize(PDF_STYLES.fonts.small);
    doc.setTextColor(PDF_STYLES.colors.secondary);
    doc.text(options.companyName, PDF_STYLES.margins.page, yPos);
    yPos += 8;
  }

  // Add title
  doc.setFontSize(PDF_STYLES.fonts.title);
  doc.setTextColor(PDF_STYLES.colors.primary);
  doc.text(title, PDF_STYLES.margins.page, yPos);
  yPos += 10;

  // Add separator line
  doc.setDrawColor(PDF_STYLES.colors.lightGray);
  doc.setLineWidth(0.5);
  doc.line(
    PDF_STYLES.margins.page,
    yPos,
    pageWidth - PDF_STYLES.margins.page,
    yPos
  );
  yPos += 10;

  return yPos;
}

/**
 * Add footer to PDF page
 */
function addFooter(
  doc: jsPDF,
  pageNumber: number,
  totalPages: number,
  pageHeight: number,
  pageWidth: number
): void {
  const footerY = pageHeight - 15;

  // Page number
  doc.setFontSize(PDF_STYLES.fonts.small);
  doc.setTextColor(PDF_STYLES.colors.secondary);
  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Generation date
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(date, pageWidth - PDF_STYLES.margins.page, footerY, {
    align: 'right',
  });
}

/**
 * Add table of contents
 */
function addTableOfContents(
  doc: jsPDF,
  charts: ChartData[],
  yPos: number
): number {
  doc.setFontSize(PDF_STYLES.fonts.heading);
  doc.setTextColor(PDF_STYLES.colors.text);
  doc.text('Table of Contents', PDF_STYLES.margins.page, yPos);
  yPos += 8;

  doc.setFontSize(PDF_STYLES.fonts.body);
  doc.setTextColor(PDF_STYLES.colors.darkGray);

  // Add TOC entries
  const entries = [
    { title: 'Chat History', page: 2 },
    ...charts.map((chart, index) => ({
      title: `${index + 1}. ${chart.title}`,
      page: 3 + index,
    })),
  ];

  entries.forEach((entry, index) => {
    doc.text(`${entry.title}`, PDF_STYLES.margins.page + 5, yPos);
    doc.text(
      `${entry.page}`,
      doc.internal.pageSize.width - PDF_STYLES.margins.page - 10,
      yPos,
      { align: 'right' }
    );
    yPos += 6;
  });

  return yPos + 10;
}

/**
 * Add chat messages to PDF
 */
function addChatMessages(
  doc: jsPDF,
  messages: ChatMessage[],
  yPos: number,
  pageWidth: number,
  pageHeight: number,
  options: PDFExportOptions
): number {
  const maxWidth = pageWidth - 2 * PDF_STYLES.margins.page;
  const bottomMargin = pageHeight - 30;

  messages.forEach((message, index) => {
    // Check if we need a new page
    if (yPos > bottomMargin) {
      doc.addPage();
      yPos = PDF_STYLES.margins.page + 20;
    }

    // Message role header
    doc.setFontSize(PDF_STYLES.fonts.subheading);
    doc.setTextColor(
      message.role === 'user'
        ? PDF_STYLES.colors.primary
        : PDF_STYLES.colors.secondary
    );

    const roleText = message.role === 'user' ? 'You' : 'Assistant';
    doc.text(roleText, PDF_STYLES.margins.page, yPos);

    // Timestamp
    if (options.includeTimestamps && message.timestamp) {
      const timestamp = new Date(message.timestamp).toLocaleString();
      doc.setFontSize(PDF_STYLES.fonts.small);
      doc.text(timestamp, pageWidth - PDF_STYLES.margins.page, yPos, {
        align: 'right',
      });
    }

    yPos += 7;

    // Message content
    doc.setFontSize(PDF_STYLES.fonts.body);
    doc.setTextColor(PDF_STYLES.colors.text);

    const lines = doc.splitTextToSize(message.content, maxWidth);
    lines.forEach((line: string) => {
      if (yPos > bottomMargin) {
        doc.addPage();
        yPos = PDF_STYLES.margins.page + 20;
      }
      doc.text(line, PDF_STYLES.margins.page, yPos);
      yPos += 5;
    });

    // Add spacing between messages
    yPos += 8;

    // Add separator line between messages
    if (index < messages.length - 1) {
      doc.setDrawColor(PDF_STYLES.colors.lightGray);
      doc.setLineWidth(0.3);
      doc.line(
        PDF_STYLES.margins.page,
        yPos,
        pageWidth - PDF_STYLES.margins.page,
        yPos
      );
      yPos += 8;
    }
  });

  return yPos;
}

/**
 * Add chart to PDF
 */
async function addChartToPDF(
  doc: jsPDF,
  chart: ChartData,
  yPos: number,
  pageWidth: number,
  pageHeight: number
): Promise<number> {
  const maxWidth = pageWidth - 2 * PDF_STYLES.margins.page;
  const bottomMargin = pageHeight - 30;

  // Check if we need a new page for the chart
  if (yPos > bottomMargin - 100) {
    doc.addPage();
    yPos = PDF_STYLES.margins.page + 20;
  }

  // Chart title
  doc.setFontSize(PDF_STYLES.fonts.heading);
  doc.setTextColor(PDF_STYLES.colors.primary);
  doc.text(chart.title, PDF_STYLES.margins.page, yPos);
  yPos += 8;

  // Chart description
  if (chart.description) {
    doc.setFontSize(PDF_STYLES.fonts.body);
    doc.setTextColor(PDF_STYLES.colors.darkGray);
    const descLines = doc.splitTextToSize(chart.description, maxWidth);
    descLines.forEach((line: string) => {
      doc.text(line, PDF_STYLES.margins.page, yPos);
      yPos += 5;
    });
    yPos += 5;
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

  if (imageData) {
    // Calculate image dimensions
    const imgWidth = maxWidth;
    const imgHeight = (imgWidth * 9) / 16; // 16:9 aspect ratio

    // Check if image fits on current page
    if (yPos + imgHeight > bottomMargin) {
      doc.addPage();
      yPos = PDF_STYLES.margins.page + 20;
    }

    // Add image
    doc.addImage(
      imageData,
      'PNG',
      PDF_STYLES.margins.page,
      yPos,
      imgWidth,
      imgHeight
    );
    yPos += imgHeight + 15;
  } else {
    doc.setTextColor(PDF_STYLES.colors.secondary);
    doc.text(
      '[Chart could not be rendered]',
      PDF_STYLES.margins.page,
      yPos
    );
    yPos += 10;
  }

  return yPos;
}

/**
 * Export chat conversation and charts to PDF
 *
 * @param messages - Array of chat messages
 * @param charts - Array of chart data
 * @param filename - Output filename (without .pdf extension)
 * @param options - Export options
 *
 * @example
 * ```typescript
 * await exportChatToPDF(
 *   messages,
 *   charts,
 *   'data-analysis-report',
 *   {
 *     title: 'Data Analysis Report',
 *     includeTableOfContents: true,
 *     includePageNumbers: true
 *   }
 * );
 * ```
 */
export async function exportChatToPDF(
  messages: ChatMessage[],
  charts: ChartData[],
  filename: string,
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Set document properties
    doc.setProperties({
      title: options.title || 'Chat Export',
      subject: options.subject || 'Chat conversation and data visualizations',
      author: options.author || 'ChatGPT Philippines',
      creator: 'ChatGPT Philippines',
    });

    let currentPage = 1;
    let yPos = PDF_STYLES.margins.page;

    // Add header
    if (options.includeHeader !== false) {
      yPos = addHeader(
        doc,
        options.title || 'Data Analysis Report',
        pageWidth,
        options
      );
    }

    // Add table of contents
    if (options.includeTableOfContents && charts.length > 0) {
      yPos = addTableOfContents(doc, charts, yPos);
      doc.addPage();
      currentPage++;
      yPos = PDF_STYLES.margins.page + 20;
    }

    // Add chat history section
    if (messages.length > 0) {
      doc.setFontSize(PDF_STYLES.fonts.heading);
      doc.setTextColor(PDF_STYLES.colors.primary);
      doc.text('Chat History', PDF_STYLES.margins.page, yPos);
      yPos += 10;

      yPos = addChatMessages(doc, messages, yPos, pageWidth, pageHeight, options);

      if (charts.length > 0) {
        doc.addPage();
        currentPage++;
        yPos = PDF_STYLES.margins.page + 20;
      }
    }

    // Add charts
    for (let i = 0; i < charts.length; i++) {
      if (i > 0) {
        doc.addPage();
        currentPage++;
        yPos = PDF_STYLES.margins.page + 20;
      }

      yPos = await addChartToPDF(doc, charts[i], yPos, pageWidth, pageHeight);
    }

    // Add page numbers to all pages
    if (options.includePageNumbers !== false || options.includeFooter !== false) {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages, pageHeight, pageWidth);
      }
    }

    // Save PDF
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    doc.save(finalFilename);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw new Error(
      `Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Export data table to PDF
 *
 * @param title - Table title
 * @param headers - Column headers
 * @param rows - Table rows
 * @param filename - Output filename
 * @param options - Export options
 */
export async function exportTableToPDF(
  title: string,
  headers: string[],
  rows: any[][],
  filename: string,
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: rows[0]?.length > 6 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.width;
    let yPos = PDF_STYLES.margins.page;

    // Add header
    if (options.includeHeader !== false) {
      yPos = addHeader(doc, title, pageWidth, options);
    }

    // Add table using autoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: yPos,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246], // Blue
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11,
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249], // Light gray
      },
      margin: { top: yPos, left: PDF_STYLES.margins.page, right: PDF_STYLES.margins.page },
    });

    // Add footer
    if (options.includePageNumbers !== false || options.includeFooter !== false) {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages, doc.internal.pageSize.height, pageWidth);
      }
    }

    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    doc.save(finalFilename);
  } catch (error) {
    console.error('Failed to export table to PDF:', error);
    throw new Error(
      `Failed to export table to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create a summary report with statistics
 *
 * @param title - Report title
 * @param summary - Summary statistics object
 * @param charts - Array of charts
 * @param filename - Output filename
 * @param options - Export options
 */
export async function exportSummaryReport(
  title: string,
  summary: Record<string, any>,
  charts: ChartData[],
  filename: string,
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = PDF_STYLES.margins.page;

    // Add header
    if (options.includeHeader !== false) {
      yPos = addHeader(doc, title, pageWidth, options);
    }

    // Add summary statistics
    doc.setFontSize(PDF_STYLES.fonts.heading);
    doc.setTextColor(PDF_STYLES.colors.primary);
    doc.text('Summary Statistics', PDF_STYLES.margins.page, yPos);
    yPos += 10;

    doc.setFontSize(PDF_STYLES.fonts.body);
    doc.setTextColor(PDF_STYLES.colors.text);

    Object.entries(summary).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      doc.text(`${label}: ${value}`, PDF_STYLES.margins.page, yPos);
      yPos += 6;
    });

    // Add charts
    if (charts.length > 0) {
      doc.addPage();
      yPos = PDF_STYLES.margins.page + 20;

      for (let i = 0; i < charts.length; i++) {
        if (i > 0) {
          doc.addPage();
          yPos = PDF_STYLES.margins.page + 20;
        }
        yPos = await addChartToPDF(doc, charts[i], yPos, pageWidth, pageHeight);
      }
    }

    // Add footer
    if (options.includePageNumbers !== false || options.includeFooter !== false) {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(doc, i, totalPages, pageHeight, pageWidth);
      }
    }

    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    doc.save(finalFilename);
  } catch (error) {
    console.error('Failed to export summary report:', error);
    throw new Error(
      `Failed to export summary report: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
