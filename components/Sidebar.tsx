import React from 'react';
import { LayoutDashboard, Inbox, CheckSquare, PieChart, Settings, FileText } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'inbox', label: 'Circular Inbox', icon: <Inbox size={20} /> },
    { id: 'tasks', label: 'Tasks & Audit', icon: <CheckSquare size={20} /> },
    { id: 'reports', label: 'Reports', icon: <PieChart size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-lg">
            <FileText size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">GeniusAI</h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase mb-4 px-2">Main Menu</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium">
          <Settings size={20} />
          Settings
        </button>
        <div className="mt-4 flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                JD
            </div>
            <div className="text-xs">
                <p className="text-white font-medium">John Doe</p>
                <p className="text-slate-500">Compliance Officer</p>
            </div>
        </div>
      </div>
    </div>
  );
};