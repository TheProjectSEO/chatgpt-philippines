'use client';

import { motion } from 'framer-motion';
import { FileDown, FileText, Presentation, Share2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportButtonsProps {
  chatContainerId: string;
  data?: any;
  fileName?: string;
}

export default function ExportButtons({ chatContainerId, data, fileName = 'report' }: ExportButtonsProps) {
  const exportToPDF = async () => {
    const element = document.getElementById(chatContainerId);
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
  };

  const exportToCSV = () => {
    if (!data) return;

    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const convertToCSV = (data: any) => {
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      return [headers, ...rows].join('\n');
    }
    return '';
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could show a toast notification here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2 mt-4"
    >
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </button>

      {data && (
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      )}

      <button
        onClick={copyShareLink}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        Share Link
      </button>
    </motion.div>
  );
}
