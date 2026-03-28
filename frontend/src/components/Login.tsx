import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, ShieldCheck, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [progress, setProgress] = useState(0);

  const handleScan = () => {
    if (step !== 'idle') return;
    setStep('scanning');
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStep('success');
        setTimeout(() => {
          onLogin();
        }, 1000);
      }
    }, 20);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950"></div>

      <div className="z-10 flex flex-col items-center space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-slate-100 tracking-[0.2em] font-mono mb-2 glitch-text">AMBER</h1>
          <p className="text-amber-500 font-mono tracking-widest text-sm">PROJECT V3.0 // ACCESS CONTROL</p>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Scanning Ring */}
          <div className={`absolute inset-0 border-4 border-amber-500/20 rounded-full ${step === 'scanning' ? 'animate-spin-slow' : ''}`}></div>
          <div className={`absolute inset-4 border-2 border-amber-500/10 rounded-full border-dashed ${step === 'scanning' ? 'animate-spin-reverse-slow' : ''}`}></div>
          
          {step === 'idle' && (
            <button 
              onClick={handleScan}
              className="group relative flex flex-col items-center justify-center w-40 h-40 rounded-full bg-slate-900/50 border border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-500 cursor-pointer"
            >
              <Fingerprint className="w-16 h-16 text-slate-500 group-hover:text-amber-500 transition-colors duration-500" />
              <span className="mt-2 text-xs font-mono text-slate-500 group-hover:text-amber-400">TOUCH ID</span>
              <div className="absolute inset-0 rounded-full bg-amber-500/5 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            </button>
          )}

          {step === 'scanning' && (
            <div className="relative flex flex-col items-center justify-center">
              <Scan className="w-20 h-20 text-amber-500 animate-pulse" />
              <div className="mt-4 text-2xl font-mono font-bold text-amber-500">{progress}%</div>
              <div className="absolute top-0 w-full h-1 bg-amber-500/50 blur-md animate-scan-vertical"></div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                <ShieldCheck className="w-12 h-12 text-green-500" />
              </div>
              <span className="text-green-500 font-mono tracking-widest text-lg">ACCESS GRANTED</span>
            </div>
          )}
        </div>

        <div className="w-80 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-100 ease-out"
            style={{ width: step === 'idle' ? '0%' : step === 'success' ? '100%' : `${progress}%` }}
          ></div>
        </div>

        <div className="text-xs text-slate-600 font-mono flex flex-col items-center space-y-1">
          <p>SECURE CONNECTION: ENCRYPTED (AES-256)</p>
          <p>UNAUTHORIZED ACCESS IS PROHIBITED</p>
        </div>
        
        {/* Backdoor for Dev */}
        <button 
          onClick={onLogin}
          className="absolute bottom-4 right-4 text-[10px] text-slate-800 hover:text-slate-600 font-mono"
        >
          [DEV_BYPASS]
        </button>
      </div>
    </div>
  );
};

export default Login;
