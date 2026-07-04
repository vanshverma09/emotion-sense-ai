import React from 'react';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-8 border-t border-slate-800/50 bg-background/80 backdrop-blur-md z-10 relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <span className="text-sm font-semibold text-slate-300 tracking-tight">Emotion Sense AI</span>
        </div>
        
        <p className="text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Advanced Face Expression Analytics. All rights reserved.
        </p>
        
        <div className="flex gap-6 text-xs text-slate-500 font-medium">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">API Docs</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
        </div>
        
      </div>
    </footer>
  );
}
