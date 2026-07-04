import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { 
  WebcamComponent, 
  PredictionCard, 
  AnalyticsCards, 
  HistoryTable, 
  ProfileSection 
} from '../components/DashboardElements';
import { ConfidenceTrendChart } from '../components/Charts';

export default function Dashboard() {
  const [currentEmotion, setCurrentEmotion] = useState({ emotion: 'Waiting...', confidence: 0 });

  return (
    <DashboardLayout>
      <div className="mb-8 mt-2">
        <h1 className="text-2xl font-bold text-white mb-1">Emotion Analysis Dashboard</h1>
        <p className="text-slate-400 text-sm">Real-time facial expression tracking and analytics.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <AnalyticsCards />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-surface rounded-2xl shadow-xl overflow-hidden border border-slate-700/50"
          >
            <div className="px-5 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Live Video Feed
              </h2>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">60 FPS</span>
            </div>
            <WebcamComponent onPredictionUpdate={setCurrentEmotion} />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Live Confidence Tracking</h3>
            <ConfidenceTrendChart />
          </motion.div>
        </div>

        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex-1">
            <PredictionCard data={currentEmotion} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex-1">
            <ProfileSection />
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mt-6">
        <HistoryTable />
      </motion.div>
    </DashboardLayout>
  );
}
