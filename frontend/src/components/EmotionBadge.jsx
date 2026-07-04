import React from 'react';
import { motion } from 'framer-motion';

export default function EmotionBadge({ emotion, confidence }) {
  const getColors = (emotion) => {
    switch (emotion?.toLowerCase()) {
      case 'happy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      case 'angry': return 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'sad': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
      case 'surprise': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
      case 'neutral': return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <motion.span 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColors(emotion)} inline-flex items-center gap-1.5 backdrop-blur-sm`}
    >
      <span className="capitalize">{emotion}</span>
      {confidence && <span className="opacity-75">({confidence}%)</span>}
    </motion.span>
  );
}
