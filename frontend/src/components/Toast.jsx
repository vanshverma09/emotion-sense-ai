import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', isVisible, onClose }) {
  const config = {
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-950/80 border-emerald-500/30' },
    error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-950/80 border-red-500/30' },
    info: { icon: Info, color: 'text-primary', bg: 'bg-blue-950/80 border-primary/30' }
  };
  
  const current = config[type];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md z-50 ${current.bg}`}
        >
          <Icon size={20} className={current.color} />
          <span className="text-sm font-medium text-slate-200">{message}</span>
          <button 
            onClick={onClose} 
            className="ml-2 p-1 rounded-md hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
