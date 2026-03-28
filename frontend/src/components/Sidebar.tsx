import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Database, ScanLine, FileText, Fingerprint, Hexagon, Globe, ShieldAlert, Satellite, ScanFace, ChevronLeft, ChevronRight, Power, Share2, Shield, Activity, Cpu, Wifi } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { to: '/', label: '综合概览 (OVERVIEW)', icon: LayoutDashboard },
    { to: '/map', label: '全球追踪 (MAP)', icon: Map },
    { to: '/data', label: '情报研判 (INTEL)', icon: Database },
    { to: '/scene', label: '现场还原 (SCENE)', icon: ScanLine },
    { to: '/forensics', label: '物证中心 (EVIDENCE)', icon: Fingerprint },
    { to: '/reports', label: '案件档案 (ARCHIVES)', icon: FileText },
  ];

  return (
    <div className={`
      ${collapsed ? 'w-20' : 'w-72'} 
      h-screen flex flex-col 
      bg-slate-950 border-r border-slate-800 
      relative transition-all duration-300 ease-in-out shadow-2xl z-50
      bg-grid-pattern
    `}>
      {/* HEADER */}
      <div className="p-4 relative z-10 flex flex-col bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className={`flex items-center space-x-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            <Hexagon className="w-10 h-10 text-blue-500 fill-blue-500/10 animate-pulse" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          
          {!collapsed && (
            <div className="animate-in fade-in slide-in-from-left-5 duration-300">
              <h1 className="text-lg font-bold text-white tracking-widest uppercase font-mono text-glow-blue">
                AMBER<span className="text-blue-500">.SYS</span>
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[10px] bg-red-900/50 text-red-400 border border-red-500/30 px-1 rounded font-mono">
                  TOP SECRET
                </span>
                <span className="text-[10px] text-slate-500 font-mono">v2.4.0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto z-10 scrollbar-hide">
        {!collapsed && (
          <div className="text-[10px] font-bold text-slate-500 mb-3 px-4 uppercase tracking-widest border-b border-slate-800 pb-1">
            Command Modules
          </div>
        )}
        
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`
                flex items-center group relative overflow-hidden
                ${collapsed ? 'justify-center px-2' : 'px-4'} 
                py-3.5 rounded-sm transition-all duration-200 
                font-mono text-sm border-l-2
                ${isActive 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-100 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                  : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-blue-300 hover:border-slate-600'
                }
              `}
              title={collapsed ? link.label : ''}
            >
              {isActive && <div className="absolute inset-0 bg-blue-400/5 animate-pulse"></div>}
              
              <Icon className={`
                w-5 h-5 transition-transform duration-300 group-hover:scale-110
                ${isActive ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]' : 'text-slate-500 group-hover:text-blue-400'}
                ${collapsed ? '' : 'mr-3'}
              `} />
              
              {!collapsed && (
                <span className={`tracking-wide ${isActive ? 'font-bold text-glow-blue' : ''}`}>
                  {link.label}
                </span>
              )}

              {/* Active Indicator Dot */}
              {isActive && !collapsed && (
                <div className="absolute right-2 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_5px_#3b82f6]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER & SYSTEM STATUS */}
      <div className="p-0 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
        {/* Collapse Toggle */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex justify-center py-2 text-slate-600 hover:text-blue-400 hover:bg-slate-800 transition-colors border-b border-slate-800"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className="p-4 space-y-4">
          {/* User Profile */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center border border-slate-600 group-hover:border-blue-500 transition-colors">
                 <img 
                   src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                   alt="Agent" 
                   className="w-8 h-8 opacity-80 group-hover:opacity-100"
                 />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold text-slate-200 truncate font-mono">AGENT.K</p>
                  <SettingsIcon className="w-3 h-3 text-slate-500 cursor-pointer hover:text-white" />
                </div>
                <div className="text-[10px] text-blue-400 font-mono flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  LEVEL 5 ACCESS
                </div>
              </div>
            )}
          </div>

          {/* System Metrics (Only when expanded) */}
          {!collapsed && (
            <div className="space-y-2 pt-2 border-t border-slate-800/50">
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                <span className="flex items-center"><Cpu className="w-3 h-3 mr-1" /> CPU</span>
                <span className="text-blue-400">34%</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-[34%] shadow-[0_0_5px_#2563eb]"></div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1 mt-2">
                <span className="flex items-center"><Wifi className="w-3 h-3 mr-1" /> NET</span>
                <span className="text-green-400">SECURE</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 w-[89%] shadow-[0_0_5px_#16a34a]"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper for the missing icon in import
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default Sidebar;
