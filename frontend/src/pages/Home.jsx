import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-6 z-10"
      >
        Emotion Sense AI
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-slate-400 mb-12 z-10 text-center max-w-xl"
      >
        Real-time facial expression recognition and advanced ML analytics for intelligent systems.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 z-10"
      >
        <Link to="/register" className="px-8 py-3 bg-primary hover:bg-blue-600 text-white rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          Start Analyzing
        </Link>
        <Link to="/login" className="px-8 py-3 bg-surface hover:bg-slate-800 text-white rounded-full font-semibold border border-slate-700 transition-all">
          Sign In
        </Link>
      </motion.div>
      
      <div className="absolute bottom-0 left-0 w-full">
        <Footer />
      </div>
    </div>
  );
}
