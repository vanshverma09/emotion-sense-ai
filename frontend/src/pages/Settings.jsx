import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Key, Settings as SettingsIcon } from 'lucide-react';
import Toast from '../components/Toast';

export default function Settings() {
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Profile & Settings</h1>
        <p className="text-slate-400 text-sm">Manage your account details and application preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={18}/> User Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" defaultValue="Admin User" className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="email" defaultValue="admin@emotionsense.ai" className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
              <div className="relative">
                <Shield size={16} className="absolute left-3 top-3 text-emerald-400" />
                <input type="text" defaultValue="Administrator" disabled className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-emerald-400/70 cursor-not-allowed" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><SettingsIcon size={18}/> System Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Camera Source</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary">
                <option>Default Camera (Integrated Webcam)</option>
                <option>USB Camera</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Inference Engine Speed</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary">
                <option>Real-time WebSockets (Max FPS)</option>
                <option>Interval POST (Balanced)</option>
                <option>Manual Snapshots Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">API Access Token</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-3 text-slate-400" />
                <input type="password" defaultValue="*******************" className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 max-w-5xl flex justify-end"
      >
        <button onClick={handleSave} className="px-8 py-2.5 bg-primary hover:bg-blue-600 rounded-lg font-semibold transition-colors shadow-lg shadow-primary/20">
          Save All Changes
        </button>
      </motion.div>

      <Toast isVisible={showToast} message="Preferences successfully updated!" type="success" onClose={() => setShowToast(false)} />
    </DashboardLayout>
  );
}
