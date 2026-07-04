import React from 'react';
import { Sidebar, Navbar } from './DashboardElements';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden selection:bg-primary/30">
        <Navbar />
        <main className="w-full max-w-7xl mx-auto grow p-6 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
