import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Camera, Activity, User, Settings, LogOut, Clock, BarChart3, Bell, Search, Video, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import Toast from './Toast';

export const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  
  return (
  <aside className="w-64 bg-surface border-r border-slate-700/50 hidden lg:flex flex-col z-20">
    <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
        <Activity size={18} className="text-white" />
      </div>
      <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        Emotion Sense
      </span>
    </div>
    <nav className="flex-1 py-6 px-4 space-y-2">
      <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
        <Camera size={20} /> Live Stream
      </Link>
      <Link to="/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/analytics') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
        <BarChart3 size={20} /> Analytics
      </Link>
      <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/history') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
        <Clock size={20} /> History
      </Link>
      <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive('/settings') ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
        <Settings size={20} /> Settings
      </Link>
    </nav>
    <div className="p-4 border-t border-slate-700/50">
      <Link to="/" className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-xl text-red-400 hover:bg-red-500/10 font-medium transition-all">
        <LogOut size={18} /> Logout
      </Link>
    </div>
  </aside>
  );
};

export const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center bg-slate-900/50 rounded-full px-4 py-2 border border-slate-700/50 w-72 focus-within:border-primary/50 transition-colors">
        <Search size={16} className="text-slate-400 mr-2" />
        <input type="text" placeholder="Search analytics..." className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder-slate-500" />
      </div>
      <div className="flex items-center gap-5">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
          title="Toggle Theme"
        >
          <Moon size={20} className={isDarkMode ? 'text-primary' : ''} />
        </button>
        <button className="relative p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
        </button>
        <Link to="/settings" className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 cursor-pointer hover:shadow-lg transition-shadow">
          <div className="w-full h-full bg-surface rounded-full flex items-center justify-center">
            <User size={18} className="text-slate-300" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export const WebcamComponent = ({ onPredictionUpdate }) => {
  const webcamRef = useRef(null);
  const ws = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleManualCapture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      const token = localStorage.getItem('access_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${apiUrl}/api/v1/emotions/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Manual capture error:", err);
    }
  };

  useEffect(() => {
    let intervalId;
    
    if (isStreaming) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const wsUrl = apiUrl.replace(/^http/, 'ws');
      ws.current = new WebSocket(`${wsUrl}/api/v1/emotions/ws/predict`);
      
      ws.current.onopen = () => {
        console.log('WebSocket Connected');
        // Capture frame rapidly for real-time feel
        intervalId = setInterval(() => {
          if (webcamRef.current && ws.current && ws.current.readyState === WebSocket.OPEN) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
              ws.current.send(imageSrc);
            }
          }
        }, 200);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data && data.emotion) {
          onPredictionUpdate({
            emotion: data.emotion,
            confidence: (data.confidence * 100).toFixed(0)
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } else {
      if (ws.current) {
        ws.current.close();
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (ws.current) ws.current.close();
    };
  }, [isStreaming, onPredictionUpdate]);

  return (
    <div className="relative aspect-[16/9] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {!isStreaming ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4 z-10">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2">
            <Video size={28} className="opacity-70 text-slate-400" />
          </div>
          <p className="font-medium">Webcam Feed Offline</p>
          <button 
            onClick={() => setIsStreaming(true)}
            className="px-6 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-full font-medium transition-all shadow-lg"
          >
            Start Camera
          </button>
        </div>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            className="w-full h-full object-cover z-0"
          />
          <div className="absolute bottom-4 flex justify-center gap-4 w-full z-20">
            <button 
              onClick={handleManualCapture}
              className="flex items-center gap-2 px-6 py-2 bg-accent/90 hover:bg-emerald-600 text-white rounded-full font-medium backdrop-blur-md shadow-lg transition-colors"
            >
              <Camera size={18} /> Capture Snapshot
            </button>
            <button 
              onClick={() => setIsStreaming(false)}
              className="px-6 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full font-medium backdrop-blur-md shadow-lg transition-colors"
            >
              Stop Stream
            </button>
          </div>
        </>
      )}
      
      {isStreaming && (
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10"
          animate={{ y: ['0%', '1000%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}
      
      <Toast 
        isVisible={showToast} 
        message="Snapshot analyzed & saved to history!" 
        type="success" 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export const PredictionCard = ({ data }) => (
  <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden h-full">
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
    <h3 className="text-slate-400 font-medium mb-2 flex items-center gap-2">
      <Activity size={16} /> Live Emotion State
    </h3>
    <div className="flex items-baseline gap-3 mb-8">
      <h2 className="text-4xl font-bold text-white capitalize tracking-tight">{data.emotion}</h2>
      <span className="text-accent font-semibold px-2 py-1 bg-accent/10 rounded text-sm">{data.confidence}%</span>
    </div>
    
    <div className="space-y-5">
      {['Happy', 'Neutral', 'Sad'].map((emotion, idx) => (
        <div key={emotion}>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-300 font-medium">{emotion}</span>
            <span className="text-slate-400">{idx === 0 ? 89 : idx === 1 ? 8 : 3}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800/50 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-accent to-emerald-400' : idx === 1 ? 'bg-gradient-to-r from-primary to-blue-400' : 'bg-slate-600'}`}
              initial={{ width: 0 }}
              animate={{ width: `${idx === 0 ? 89 : idx === 1 ? 8 : 3}%` }}
              transition={{ duration: 1.5, delay: 0.5 + (idx * 0.2), ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AnalyticsCards = () => {
  const stats = [
    { label: 'Total Inferences', value: '24,592', change: '+12%', isPositive: true },
    { label: 'Avg Confidence', value: '94.2%', change: '+2.1%', isPositive: true },
    { label: 'Session Time', value: '42m 18s', change: 'Live', isNeutral: true },
    { label: 'Dominant Emotion', value: 'Happy', change: '84% of time', isPositive: true }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-surface border border-slate-700/50 rounded-2xl p-5 shadow-lg hover:border-slate-600 transition-colors">
          <p className="text-slate-400 text-sm font-medium mb-3">{stat.label}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
              stat.isNeutral ? 'bg-slate-800 text-secondary' : 'bg-accent/10 text-accent'
            }`}>
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Charts = () => (
  <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl h-[300px] flex flex-col justify-center items-center text-slate-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50"></div>
    <BarChart3 size={48} className="mb-4 opacity-30 text-primary" />
    <p className="font-medium">Emotion Variance Timeline</p>
    <p className="text-sm mt-1">(Recharts Integration Pending)</p>
  </div>
);

export const HistoryTable = () => (
  <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-white">Recent Inferences</h3>
      <button className="text-sm text-primary hover:text-blue-400 transition-colors">View All</button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800/40 text-slate-400">
          <tr>
            <th className="px-5 py-3.5 rounded-tl-lg font-medium">Timestamp</th>
            <th className="px-5 py-3.5 font-medium">Emotion</th>
            <th className="px-5 py-3.5 font-medium">Confidence</th>
            <th className="px-5 py-3.5 rounded-tr-lg font-medium">Latency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {[1, 2, 3, 4].map((row) => (
            <tr key={row} className="hover:bg-slate-800/20 transition-colors">
              <td className="px-5 py-4 font-mono text-xs text-slate-400">2026-07-04 14:32:0{row}</td>
              <td className="px-5 py-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Happy</span>
              </td>
              <td className="px-5 py-4 font-medium text-white">96.{row}%</td>
              <td className="px-5 py-4 text-slate-400">4{row}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ProfileSection = () => (
  <div className="bg-surface border border-slate-700/50 rounded-2xl p-6 shadow-xl h-full">
    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
       <Settings size={16} className="text-slate-400"/> System Status
    </h3>
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30">
        <span className="text-slate-400 text-sm">Model Version</span>
        <span className="bg-slate-800 text-xs px-2.5 py-1 rounded-md font-mono text-slate-300 border border-slate-700">v2.1.0-keras</span>
      </div>
      <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30">
        <span className="text-slate-400 text-sm">API Connection</span>
        <span className="flex items-center gap-2 text-accent text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Connected
        </span>
      </div>
      <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30">
        <span className="text-slate-400 text-sm">WebSocket</span>
        <span className="flex items-center gap-2 text-slate-500 text-sm font-medium">
           <span className="w-2 h-2 rounded-full bg-slate-600"></span> Disconnected
        </span>
      </div>
    </div>
  </div>
);
