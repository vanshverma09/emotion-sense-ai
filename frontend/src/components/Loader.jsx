import React from 'react';
import { motion } from 'framer-motion';

export default function Loader({ text = "Loading AI Models..." }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative w-12 h-12">
        {/* Background track */}
        <motion.div 
          className="absolute inset-0 border-4 border-slate-800 rounded-full"
        />
        {/* Spinning indicator */}
        <motion.div 
          className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p className="text-sm text-slate-400 font-medium animate-pulse">{text}</p>
    </div>
  );
}
