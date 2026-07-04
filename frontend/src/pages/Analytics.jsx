import React, { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AnalyticsCards } from '../components/DashboardElements';
import { ConfidenceTrendChart, EmotionDistributionChart, DailyPredictionsChart, WeeklyPredictionsChart } from '../components/Charts';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Toast from '../components/Toast';

export default function Analytics() {
  const reportRef = useRef();
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0F172A' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('emotion_analytics_report.pdf');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Detailed Analytics</h1>
          <p className="text-slate-400 text-sm">Deep dive into emotion variance and trends.</p>
        </div>
        <button 
          onClick={generatePDF} 
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-primary/20"
        >
          <FileText size={16} /> {isExporting ? 'Generating...' : 'Download Report'}
        </button>
      </div>
      
      <div ref={reportRef} className="space-y-6 p-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <AnalyticsCards />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">Confidence Trend</h3>
            <ConfidenceTrendChart />
          </div>
          <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">Emotion Distribution</h3>
            <EmotionDistributionChart />
          </div>
          <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">Daily Predictions</h3>
            <DailyPredictionsChart />
          </div>
          <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-6">Weekly Happy Trend</h3>
            <WeeklyPredictionsChart />
          </div>
        </motion.div>
      </div>
      <Toast isVisible={showToast} message="PDF Report successfully generated!" type="success" onClose={() => setShowToast(false)} />
    </DashboardLayout>
  );
}
