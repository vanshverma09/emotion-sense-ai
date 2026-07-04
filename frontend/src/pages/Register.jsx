import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Register() {
  const navigate = useNavigate();
  
  const handleRegister = (e) => {
    e.preventDefault();
    // TODO: Hook up with FastAPI backend POST /api/v1/auth/register
    navigate('/login'); 
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface p-8 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md relative z-10"
      >
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-slate-400 mb-8">Start analyzing emotions instantly</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input type="text" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <input type="email" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input type="password" required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary hover:bg-blue-600 rounded-lg font-semibold transition-colors mt-6 shadow-lg shadow-primary/20">
            Sign Up
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
