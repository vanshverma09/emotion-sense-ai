import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { HistoryTable } from '../components/DashboardElements';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import Toast from '../components/Toast';

export default function History() {
  const [showToast, setShowToast] = useState(false);

  const handleExportCSV = () => {
    // Mock CSV export logic
    const csvContent = "data:text/csv;charset=utf-8,Timestamp,Emotion,Confidence,Latency\n2026-07-04 14:32:01,Happy,96.1%,41ms\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "emotion_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Inference History</h1>
          <p className="text-slate-400 text-sm">View and export all past emotion predictions.</p>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-slate-800 text-white rounded-lg border border-slate-700 transition-colors shadow-lg">
          <Download size={16} /> Export CSV
        </button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HistoryTable />
      </motion.div>
      <Toast isVisible={showToast} message="History exported as CSV!" type="success" onClose={() => setShowToast(false)} />
    </DashboardLayout>
  );
}
