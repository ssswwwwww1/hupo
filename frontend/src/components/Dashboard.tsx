import React, { useEffect, useState, useRef } from 'react';
import { getCases, Case } from '../api';
import { AlertCircle, Clock, MapPin, Target, Bell, Activity, ShieldAlert, Radio, Users, Plane, Database, Lock, Globe, Server, Terminal, Cpu } from 'lucide-react';
import SystemMonitor from './SystemMonitor';

interface Alert {
  type: string;
  message: string;
  timestamp: string;
}

const ThreatLevel = () => (
  <div className="tech-panel rounded-sm p-4 flex flex-col items-center justify-center relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-amber-500 to-red-500 opacity-80"></div>
    <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
    
    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center">
      <ShieldAlert className="w-3 h-3 mr-2 text-red-500" />
      Threat Level
    </h3>
    
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900/50 relative z-10">
        <div className="absolute inset-0 rounded-full border-t-4 border-red-500 animate-spin-slow"></div>
        <div className="absolute inset-2 rounded-full border-b-4 border-amber-500 animate-spin-reverse-slow opacity-50"></div>
        <span className="text-4xl font-black text-red-500 font-mono text-glow-red">3</span>
      </div>
      <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
    </div>
    
    <div className="mt-3 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/30 px-2 py-0.5 rounded bg-red-900/20">
      ELEVATED
    </div>
  </div>
);

const ResourceStatus = () => (
  <div className="tech-panel rounded-sm p-4">
    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center border-b border-slate-800 pb-2">
      <Radio className="w-3 h-3 mr-2 text-blue-500" /> Active Assets
    </h3>
    <div className="space-y-4">
      <div className="group">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center text-xs text-slate-300 font-mono">
            <Plane className="w-3 h-3 mr-2 text-sky-500" /> UAV DRONES
          </div>
          <span className="text-[10px] font-mono text-sky-400">12/14 ONLINE</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 w-[85%] shadow-[0_0_5px_#0ea5e9] group-hover:w-[90%] transition-all duration-500"></div>
        </div>
      </div>
      
      <div className="group">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center text-xs text-slate-300 font-mono">
            <Users className="w-3 h-3 mr-2 text-emerald-500" /> FIELD AGENTS
          </div>
          <span className="text-[10px] font-mono text-emerald-400">8/12 ACTIVE</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-[60%] shadow-[0_0_5px_#10b981] group-hover:w-[65%] transition-all duration-500"></div>
        </div>
      </div>

      <div className="group">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center text-xs text-slate-300 font-mono">
            <Database className="w-3 h-3 mr-2 text-purple-500" /> DATA NODES
          </div>
          <span className="text-[10px] font-mono text-purple-400">CONNECTED</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 w-[98%] shadow-[0_0_5px_#a855f7]"></div>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color, sub }: any) => (
  <div className="tech-panel rounded-sm p-5 flex items-center justify-between group hover:border-blue-500/50 transition-colors">
    <div>
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">{label}</p>
      <p className={`text-3xl font-bold font-mono ${color} text-glow-${color.split('-')[1]}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-2 flex items-center font-mono">
         <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
         {sub}
      </p>
    </div>
    <div className={`p-3 rounded-md bg-slate-900/50 border border-slate-700 ${color.replace('text', 'text')} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 opacity-80" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const alertsEndRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getCases();
        setCases(data);
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();

    // WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws/alerts');
    
    ws.onopen = () => {
      setAlerts(prev => [...prev, { type: 'System', message: 'UPLINK ESTABLISHED: SECURE CHANNEL 7', timestamp: new Date().toISOString() }]);
    };

    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      setAlerts((prev) => [...prev, alert]);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (alertsEndRef.current) {
      alertsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [alerts]);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto bg-grid-pattern relative">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-slate-800 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center font-mono tracking-tight">
              <Activity className="mr-3 text-blue-500 w-6 h-6" />
              COMMAND_CENTER
            </h2>
            <div className="flex items-center mt-1 ml-9 space-x-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Integrated Intelligence Platform</span>
              <span className="text-[10px] px-1 bg-blue-900/30 text-blue-400 border border-blue-500/30 rounded font-mono">LIVE</span>
            </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-mono text-slate-200 font-bold tracking-widest">
            {time.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className="text-xs text-slate-500 font-mono uppercase tracking-widest">
            {time.toLocaleDateString()} | ZONE: ASIA-HK
          </div>
        </div>
      </div>

      {/* SYSTEM MONITOR BAR */}
      <SystemMonitor />

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ThreatLevel />
        <StatCard 
          label="SYSTEM STATUS" 
          value="OPTIMAL" 
          icon={Server} 
          color="text-emerald-500" 
          sub="ALL SUBSYSTEMS ONLINE" 
        />
        <StatCard 
          label="ACTIVE OPS" 
          value={cases.filter(c => c.status === 'Open').length} 
          icon={Target} 
          color="text-blue-500" 
          sub="HIGH PRIORITY: 2" 
        />
        <StatCard 
          label="INTEL FLOW" 
          value="892 TB" 
          icon={Database} 
          color="text-purple-500" 
          sub="+12% INGEST RATE" 
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
        {/* GLOBAL OPS TABLE */}
        <div className="lg:col-span-3 tech-panel rounded-sm flex flex-col h-full">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <h3 className="font-bold text-sm text-slate-100 flex items-center font-mono tracking-wider">
              <Globe className="w-4 h-4 mr-2 text-blue-500" />
              GLOBAL OPERATIONS
            </h3>
            <div className="flex space-x-2">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
               <span className="w-2 h-2 bg-slate-700 rounded-full"></span>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-500 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 font-normal uppercase tracking-widest border-b border-slate-800">Case ID</th>
                  <th className="px-6 py-3 font-normal uppercase tracking-widest border-b border-slate-800">Codename</th>
                  <th className="px-6 py-3 font-normal uppercase tracking-widest border-b border-slate-800">Severity</th>
                  <th className="px-6 py-3 font-normal uppercase tracking-widest border-b border-slate-800">Status</th>
                  <th className="px-6 py-3 font-normal uppercase tracking-widest border-b border-slate-800">Geo-Loc</th>
                  <th className="px-6 py-3 font-normal uppercase tracking-widest border-b border-slate-800">Last Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-600">
                        LOADING DATA STREAMS...
                    </td>
                  </tr>
                ) : (
                  cases.map((c, i) => (
                    <tr key={c.id} className="hover:bg-blue-900/10 transition-colors group cursor-pointer">
                      <td className="px-6 py-3 text-amber-500 font-bold border-l-2 border-transparent group-hover:border-amber-500 transition-all">
                        {c.id}
                      </td>
                      <td className="px-6 py-3 text-slate-300 font-bold group-hover:text-white group-hover:text-glow-blue transition-colors">
                        {c.title}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border ${
                          c.severity === 'high' ? 'bg-red-900/20 border-red-500/50 text-red-500' : 
                          c.severity === 'medium' ? 'bg-amber-900/20 border-amber-500/50 text-amber-500' : 'bg-emerald-900/20 border-emerald-500/50 text-emerald-500'
                        }`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="flex items-center text-[10px] uppercase">
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${c.status === 'Open' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-600'}`}></span>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-400 flex items-center">
                        {c.location.address.split(',')[0]}
                      </td>
                      <td className="px-6 py-3 text-slate-500">{new Date(c.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6 h-full">
            <ResourceStatus />
            
            <div className="tech-panel rounded-sm flex flex-col flex-1 relative h-full">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <h3 className="font-bold text-sm text-slate-100 flex items-center font-mono tracking-wider">
                  <Terminal className="w-4 h-4 mr-2 text-amber-500" />
                  SYSTEM LOGS
                  </h3>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-0 font-mono text-[10px] bg-black/60 custom-scrollbar">
                  {/* Scanline overlay for logs */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                  
                  {alerts.length === 0 && <div className="text-slate-600 text-center mt-10">AWAITING INPUT...</div>}
                  
                  <div className="p-2 space-y-1">
                    {alerts.map((alert, idx) => (
                    <div key={idx} className={`flex space-x-2 p-1 hover:bg-white/5 transition-colors ${
                        alert.type === 'Critical' ? 'text-red-400' :
                        alert.type === 'Warning' ? 'text-amber-400' :
                        'text-emerald-400'
                    }`}>
                        <span className="opacity-50 text-slate-500">[{new Date(alert.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
                        <span className="font-bold">{`>`}</span>
                        <span className="">{alert.message}</span>
                    </div>
                    ))}
                    <div ref={alertsEndRef} className="animate-pulse">_</div>
                  </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
