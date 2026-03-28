import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Network, Database, Layers, Share2, Search, ZoomIn, ZoomOut, Maximize, User, CreditCard, MapPin, Activity, ShieldAlert, Cpu, Terminal, Wifi, Filter, Crosshair, AlertTriangle, FileText, Globe, Lock } from 'lucide-react';
import KnowledgeGraph from './KnowledgeGraph';

// --- Global Search Sub-Module ---
const GlobalSearchModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearching(true);
    setResults([]);
    
    // Simulate search delay
    setTimeout(() => {
      setSearching(false);
      setResults([
        { id: 'REC-9921', title: 'Suspicious Transaction Log #9921', type: 'Financial', date: '2024-03-15', source: 'Bank of Cayman' },
        { id: 'INT-4420', title: 'Intercepted Comms: "Project Amber"', type: 'Signal', date: '2024-03-14', source: 'Satellite Node 7' },
        { id: 'IMG-8821', title: 'Surveillance Photo: Target B', type: 'Image', date: '2024-03-14', source: 'CCTV Grid A' },
        { id: 'DOC-1102', title: 'Flight Manifest: Flight MH370', type: 'Document', date: '2024-03-13', source: 'Airline DB' },
      ]);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-xl border border-slate-700 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-slate-100 mb-2 flex items-center justify-center">
          <Globe className="w-6 h-6 mr-2 text-blue-500" />
          全球情报检索系统 (GLOBAL INTEL SEARCH)
        </h3>
        <p className="text-slate-400 text-sm">Accessing 142 Global Databases... Authorized Personnel Only</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 relative max-w-2xl mx-auto w-full">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter keywords, ID, or suspect name..."
            className="w-full bg-slate-800 border border-slate-600 rounded-full py-4 pl-12 pr-6 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-lg"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold transition-colors"
          >
            SEARCH
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full space-y-4 custom-scrollbar">
        {searching ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-blue-400 font-mono text-sm animate-pulse">Scanning Global Nodes...</p>
          </div>
        ) : results.length > 0 ? (
          results.map((res, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg hover:bg-slate-700/50 transition-all cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className={`p-2 rounded bg-slate-800 mr-4 border ${
                    res.type === 'Financial' ? 'border-amber-500/30 text-amber-500' :
                    res.type === 'Signal' ? 'border-green-500/30 text-green-500' :
                    res.type === 'Image' ? 'border-purple-500/30 text-purple-500' :
                    'border-blue-500/30 text-blue-500'
                  }`}>
                    {res.type === 'Financial' ? <CreditCard className="w-5 h-5" /> :
                     res.type === 'Signal' ? <Wifi className="w-5 h-5" /> :
                     res.type === 'Image' ? <User className="w-5 h-5" /> :
                     <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{res.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center">
                      <Database className="w-3 h-3 mr-1" /> {res.source}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-500">{res.date}</span>
                  <div className="mt-1 text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-300 inline-block">{res.id}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-600 mt-20">
            <Lock className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Secure Connection Established. Ready for Query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Data Analysis Main Component ---
const DataAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'search'>('overview');
  const [streamData, setStreamData] = useState<string[]>([]);
  const [typedText, setTypedText] = useState('');
  const fullText = ">> 正在检测东南亚地区的异常模式...\n>> 发现 [加密钱包 A] 与 [离岸银行 04] 之间的关联。\n>> 建议: 对节点 772 启动深度包检测。欺诈概率: 89.4%。";

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    setTypedText('');
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(prev => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [activeTab]); // Reset when tab changes
  useEffect(() => {
    const messages = [
      "截获节点 882 的加密信号...",
      "检测到大额交易: 500 ETH [钱包 x772]",
      "确认新嫌疑人: 曼谷 'Ghost'",
      "VOIP 网关握手失败 - IP 192.168.4.2",
      "面部匹配确认: 目标 #991 (98%)",
      "卫星链路已建立: 第 7 扇区",
      "暗网市场 'Hydra' 活动激增检测"
    ];
    
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const time = new Date().toLocaleTimeString();
      setStreamData(prev => [`[${time}] ${msg}`, ...prev].slice(0, 8));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Mock Chart Data
  const data = [
    { name: 'Mon', active: 4000, intercepted: 2400 },
    { name: 'Tue', active: 3000, intercepted: 1398 },
    { name: 'Wed', active: 2000, intercepted: 9800 },
    { name: 'Thu', active: 2780, intercepted: 3908 },
    { name: 'Fri', active: 1890, intercepted: 4800 },
    { name: 'Sat', active: 2390, intercepted: 3800 },
    { name: 'Sun', active: 3490, intercepted: 4300 },
  ];

  const pieData = [
    { name: 'VOIP', value: 400 },
    { name: 'SMS', value: 300 },
    { name: 'Crypto', value: 300 },
    { name: 'Bank', value: 200 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col bg-slate-900 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0 relative z-10 border-b border-slate-700 pb-4">
        <div className="flex items-center">
          <div className="relative w-10 h-10 flex items-center justify-center mr-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
             <Database className="w-6 h-6 text-blue-500" />
          </div>
          <div>
             <h2 className="text-2xl font-bold text-slate-100 tracking-tight">情报研判中心</h2>
             <div className="text-xs text-slate-400 mt-1 uppercase">Intelligence Analysis Division</div>
          </div>
        </div>
        
        <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 shadow-sm">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            <Activity className="w-3 h-3 mr-2" />
            数据总览 (OVERVIEW)
          </button>
          <button 
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center ${activeTab === 'graph' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            <Share2 className="w-3 h-3 mr-2" />
            关联图谱 (RELATIONS)
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center ${activeTab === 'search' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
          >
            <Search className="w-3 h-3 mr-2" />
            情报检索 (SEARCH)
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        {activeTab === 'overview' && (
          <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-700">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: '活跃案件 (ACTIVE)', value: '124', icon: Layers, color: 'text-blue-500', border: 'border-blue-500/20' },
                 { label: '高危目标 (HIGH RISK)', value: '18', icon: Crosshair, color: 'text-red-500', border: 'border-red-500/20' },
                 { label: '数据拦截 (INTERCEPTS)', value: '8.4M', icon: Wifi, color: 'text-indigo-500', border: 'border-indigo-500/20' },
                 { label: '系统负载 (LOAD)', value: '42%', icon: Cpu, color: 'text-emerald-500', border: 'border-emerald-500/20' },
               ].map((stat, i) => (
                 <div key={i} className={`bg-slate-800 border ${stat.border} p-4 rounded-lg flex items-center justify-between shadow-sm`}>
                    <div>
                       <div className="text-xs text-slate-500 font-bold tracking-wider mb-1">{stat.label}</div>
                       <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
               {/* Main Chart */}
               <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-5 shadow-sm flex flex-col">
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center border-b border-slate-700 pb-2">
                    <Activity className="w-4 h-4 mr-2 text-blue-500" />
                    活动流量分析 (ACTIVITY TRAFFIC)
                  </h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
                          itemStyle={{ color: '#cbd5e1' }}
                        />
                        <Area type="monotone" dataKey="active" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} />
                        <Area type="monotone" dataKey="intercepted" stroke="#6366f1" fillOpacity={1} fill="url(#colorInt)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Right Column: Feed & Pie */}
               <div className="flex flex-col gap-6">
                  {/* Live Feed */}
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex-1 overflow-hidden flex flex-col shadow-sm">
                     <h3 className="text-xs font-bold text-green-500 mb-3 flex items-center">
                       <Terminal className="w-3 h-3 mr-2" />
                       实时数据流 (LIVE STREAM)
                     </h3>
                     <div className="flex-1 overflow-hidden space-y-2 font-mono text-xs">
                        {streamData.map((log, i) => (
                          <div key={i} className="text-slate-400 border-b border-slate-700/50 pb-1 truncate">
                             <span className="text-green-600 mr-2">{'>'}</span>{log}
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Distribution */}
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-[240px] shadow-sm relative">
                     <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
                        <h3 className="text-xs font-bold text-slate-300">威胁分布 (THREAT DIST)</h3>
                        <Activity className="w-3 h-3 text-slate-500" />
                     </div>
                     
                     <div className="relative w-full h-[180px] flex items-center justify-center">
                         {/* CSS Animated Rings */}
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* Outer Ring */}
                            <div className="w-[170px] h-[170px] rounded-full border border-slate-700/30 border-t-blue-500/50 border-r-blue-500/50 animate-spin-slow"></div>
                            {/* Inner Ring */}
                            <div className="absolute w-[100px] h-[100px] rounded-full border border-slate-700/30 border-b-amber-500/50 border-l-amber-500/50 animate-spin-reverse-slow"></div>
                         </div>

                         {/* Center Label */}
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4 z-10">
                            <div className="text-2xl font-bold text-white font-mono tracking-tighter animate-pulse">
                              {pieData.reduce((acc, cur) => acc + cur.value, 0)}
                            </div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest">Alerts</div>
                         </div>
 
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              {/* Main Data Pie */}
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={72}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="#1e293b"
                                strokeWidth={3}
                                cornerRadius={4}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    stroke={COLORS[index % COLORS.length]}
                                    strokeOpacity={0.2}
                                    strokeWidth={6} // Glow effect hack
                                  />
                                ))}
                              </Pie>
                              
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                                  borderColor: 'rgba(59, 130, 246, 0.5)', 
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                                }}
                                itemStyle={{ color: '#e2e8f0', fontFamily: 'monospace' }}
                                separator=" -> "
                              />
                              <Legend 
                                verticalAlign="bottom" 
                                height={24}
                                iconType="circle"
                                iconSize={6}
                                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }}
                              />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                  </div>
               </div>
            </div>
            
            {/* AI Insight Panel */}
            <div className="bg-gradient-to-r from-slate-800 to-indigo-900/30 border border-indigo-500/30 p-6 rounded-lg relative overflow-hidden shadow-sm">
               <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
               <h3 className="text-indigo-400 font-bold mb-2 flex items-center text-sm">
                 <Cpu className="w-4 h-4 mr-2" />
                 AI 智能研判分析 (AI ANALYSIS)
               </h3>
               <p className="text-slate-300 text-sm leading-relaxed font-sans opacity-90 font-mono whitespace-pre-line min-h-[4.5em]">
                 {typedText}
                 <span className="animate-pulse">_</span>
               </p>
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="h-full bg-slate-950 rounded-xl border border-slate-800 p-1 shadow-inner relative">
             <KnowledgeGraph />
          </div>
        )}

        {activeTab === 'search' && (
          <div className="h-full bg-slate-950 rounded-xl border border-slate-800 p-1 shadow-inner relative">
             <GlobalSearchModule />
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalysis;
