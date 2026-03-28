import React, { useEffect, useState } from 'react';
import { Cpu, Wifi, HardDrive, Shield } from 'lucide-react';

const SystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    security: 100
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 10) + 40,
        network: Math.floor(Math.random() * 50) + 120,
        security: 98 + Math.floor(Math.random() * 2)
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'CPU 使用率', value: `${metrics.cpu}%`, icon: Cpu, sub: '负载稳定' },
        { label: '网络上行', value: `${metrics.network} MB/s`, icon: Wifi, sub: '加密传输' },
        { label: '内存占用', value: `${metrics.memory}%`, icon: HardDrive, sub: '正常' },
        { label: '安全状态', value: '安全', icon: Shield, sub: '防火墙开启' },
      ].map((m, i) => (
        <div key={i} className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">{m.label}</div>
            <div className="text-xl font-bold text-slate-200">{m.value}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
              {m.sub}
            </div>
          </div>
          <m.icon className="w-8 h-8 text-slate-600" />
        </div>
      ))}
    </div>
  );
};

export default SystemMonitor;
