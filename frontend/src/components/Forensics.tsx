import React, { useState, useRef, useEffect } from 'react';
import { FileCode, Unlock, Upload, CheckCircle, Search, Binary, Eye, Folder, ChevronRight, ChevronDown, FileText, FileImage, FileAudio, Video, Mic, ScanFace, Database, Lock, Play, Pause, Plus, Loader2 } from 'lucide-react';

// --- Sub-components (Visualizers) ---

  const AudioWaveform = ({ playing }: { playing: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 80;
      const bars = 50;
      const barWidth = canvas.width / bars;
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3b82f6'; // Blue
        for (let i = 0; i < bars; i++) {
          const height = playing ? Math.random() * canvas.height * 0.8 : 5;
          ctx.fillRect(i * barWidth, (canvas.height - height) / 2, barWidth - 2, height);
        }
      };
      const interval = setInterval(draw, 50);
      return () => clearInterval(interval);
    }, [playing]);
    return <canvas ref={canvasRef} className="w-full h-20 bg-slate-800 rounded border border-slate-700" />;
  };

  const FaceReconstruction = () => {
    const [progress, setProgress] = useState(0);
    const [stage, setStep] = useState('扫描中');
    useEffect(() => {
      const interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5));
      }, 50);
      return () => clearInterval(interval);
    }, []);
    useEffect(() => {
      if (progress < 30) setStep('扫描中');
      else if (progress < 60) setStep('建模中');
      else if (progress < 90) setStep('渲染中');
      else setStep('完成');
    }, [progress]);
    return (
      <div className="relative w-48 h-48 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center mx-auto">
        <div className={`relative w-32 h-40 transition-all duration-500 ${progress > 60 ? 'opacity-100 blur-0' : 'opacity-50 blur-sm'}`}>
           <ScanFace className="w-full h-full text-slate-500" />
           <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-md" style={{ top: `${(progress % 100)}%` }}></div>
        </div>
        <div className="absolute bottom-2 left-2 text-xs font-medium text-blue-400 bg-slate-900/80 px-2 py-1 rounded">{stage}</div>
      </div>
    );
  };

// --- Main Forensics Component ---

const Forensics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'voice' | 'face'>('general');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [voiceResult, setVoiceResult] = useState<boolean>(false);
  const [faceResult, setFaceResult] = useState<boolean>(false);
  
  // BioDecoder States
  const [playing, setPlaying] = useState(false);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'general' | 'audio' | 'image' | 'data'>('general');

  // File Tree State
  const [fileTree, setFileTree] = useState([
    { name: '物证箱_001', type: 'folder', children: [
        { name: 'intercept_audio_04.wav', type: 'audio' },
        { name: 'cctv_frame_882.jpg', type: 'image' },
        { name: 'encrypted_log.dat', type: 'code' },
    ]},
    { name: '嫌疑人设备', type: 'folder', children: [
        { name: 'phone_backup.bin', type: 'code' },
        { name: 'voice_memo.mp3', type: 'audio' },
    ]},
    { name: '新上传文件', type: 'folder', children: [] as any[] }
  ]);

  const handleFileSelect = (name: string, type: string) => {
    setSelectedFile(name);
    setResult(null);
    setVoiceResult(false);
    setFaceResult(false);
    setProgress(0);
    setAnalyzing(false);
    
    // Auto-switch tabs based on file type
    if (type === 'audio') setActiveTab('voice');
    else if (type === 'image') setActiveTab('face');
    else setActiveTab('general');
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setAnalyzing(false);
        if (activeTab === 'general') setResult(true);
        if (activeTab === 'voice') setVoiceResult(true);
        if (activeTab === 'face') setFaceResult(true);
      }
    }, 50);
  };

  const triggerUpload = (type: 'general' | 'audio' | 'image' | 'data') => {
    setUploadType(type);
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine file type icon
    let type = 'code';
    if (uploadType === 'audio') type = 'audio';
    if (uploadType === 'image') type = 'image';
    if (uploadType === 'data') type = 'code';
    
    // Add to "New_Uploads" folder
    const newFile = { name: file.name, type };
    setFileTree(prev => prev.map(folder => {
        if (folder.name === '新上传文件') {
            return { ...folder, children: [...folder.children, newFile] };
        }
        return folder;
    }));

    // Select the new file
    handleFileSelect(file.name, type);
    
    // Clear input
    e.target.value = '';
  };

  return (
    <div className="h-full flex bg-slate-950 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload}
      />
      
      {/* LEFT: Evidence File Tree */}
      <div className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <h3 className="font-bold text-slate-200 flex items-center">
            <Folder className="w-4 h-4 mr-2 text-blue-500" />
            证据保管柜
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {fileTree.map((folder, i) => (
            <div key={i} className="mb-2">
              <div className="flex items-center text-xs font-bold text-slate-400 px-2 py-1">
                <ChevronDown className="w-3 h-3 mr-1" />
                {folder.name}
              </div>
              <div className="ml-4 space-y-1 border-l border-slate-700 pl-2">
                {folder.children.map((file, j) => (
                  <div 
                    key={j}
                    onClick={() => handleFileSelect(file.name, file.type)}
                    className={`flex items-center text-xs px-2 py-1.5 rounded cursor-pointer transition-colors ${selectedFile === file.name ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    {file.type === 'audio' && <FileAudio className="w-3 h-3 mr-2" />}
                    {file.type === 'image' && <FileImage className="w-3 h-3 mr-2" />}
                    {file.type === 'code' && <FileCode className="w-3 h-3 mr-2" />}
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={() => triggerUpload('general')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-xs border border-slate-600 flex items-center justify-center transition-colors"
          >
            <Upload className="w-3 h-3 mr-2" /> 上传新证据
          </button>
        </div>
      </div>

      {/* RIGHT: Analysis Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
        
        {/* Header & Tabs */}
        <div className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center">
              <Binary className="w-6 h-6 text-blue-500 mr-3" />
              综合证据分析中心
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              当前选中: {selectedFile || '未选择文件'}
            </div>
          </div>
          
          <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setActiveTab('general')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'general' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              通用解密
            </button>
            <button 
              onClick={() => setActiveTab('voice')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'voice' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              声纹解密
            </button>
            <button 
              onClick={() => setActiveTab('face')}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'face' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            >
              面部分析
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900 relative">
          
          {!selectedFile ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-70">
               <div className="flex space-x-4 mb-8">
                  <button onClick={() => triggerUpload('general')} className="p-4 border border-slate-700 rounded hover:bg-slate-800 flex flex-col items-center w-32 transition-colors">
                    <Unlock className="w-8 h-8 mb-2 text-blue-500" />
                    <span className="text-xs font-medium">通用解密</span>
                  </button>
                  <button onClick={() => triggerUpload('audio')} className="p-4 border border-slate-700 rounded hover:bg-slate-800 flex flex-col items-center w-32 transition-colors">
                    <Mic className="w-8 h-8 mb-2 text-blue-500" />
                    <span className="text-xs font-medium">声纹上传</span>
                  </button>
                  <button onClick={() => triggerUpload('image')} className="p-4 border border-slate-700 rounded hover:bg-slate-800 flex flex-col items-center w-32 transition-colors">
                    <ScanFace className="w-8 h-8 mb-2 text-blue-500" />
                    <span className="text-xs font-medium">面部照片</span>
                  </button>
               </div>
               <p>请选择文件或上传以开始分析</p>
             </div>
          ) : (
            <>
              {/* --- TAB: GENERAL DECRYPTION --- */}
              {activeTab === 'general' && (
                <div className="grid grid-cols-2 gap-6 h-full">
                   <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-blue-500 font-bold flex items-center"><Unlock className="w-4 h-4 mr-2" /> 十六进制查看器 (HEX VIEWER)</h3>
                        <button onClick={() => triggerUpload('general')} className="text-xs flex items-center bg-slate-700 px-3 py-1.5 rounded hover:bg-slate-600 text-slate-200 transition-colors">
                          <Upload className="w-3 h-3 mr-1" /> 导入文件
                        </button>
                      </div>
                      <div className="flex-1 font-mono text-xs text-slate-400 overflow-hidden relative bg-slate-900/50 p-2 rounded border border-slate-700">
                         {analyzing && <div className="absolute inset-0 bg-blue-500/10 animate-pulse z-10 flex items-center justify-center"><span className="bg-slate-900 px-2 py-1 rounded text-blue-400">Processing...</span></div>}
                         <div className="opacity-80">
                           {Array(20).fill(0).map((_, i) => (
                             <div key={i}>0000{i}0  A1 B2 C3 D4 E5 F6 12 34  56 78 90 AB CD EF 00 11  ................</div>
                           ))}
                         </div>
                      </div>
                      <button 
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold disabled:opacity-50 transition-colors"
                      >
                        {analyzing ? `正在解密... ${progress}%` : '运行解密算法'}
                      </button>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2">元数据</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between"><span className="text-slate-500">文件大小:</span> <span className="text-slate-200">2.4 MB</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">创建时间:</span> <span className="text-slate-200">2024-02-15 09:21:11</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">所有者:</span> <span className="text-slate-200">ENCRYPTED_USER</span></div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm">
                         <h4 className="text-sm font-bold text-slate-300 mb-3 border-b border-slate-700 pb-2">AI 物件分析报告</h4>
                         <div className="text-xs text-slate-300 leading-relaxed p-2 rounded bg-slate-900/30">
                            对目标文件结构分析显示，该文件采用了多层隐写术加密。特征码匹配显示可能与 "Operation Blackout" 有关。建议进一步进行关联分析。
                         </div>
                      </div>

                      {result && (
                        <div className="bg-green-900/10 border border-green-500/30 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-4">
                          <h4 className="text-sm font-bold text-green-500 mb-2 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> 解密成功</h4>
                          <div className="p-3 bg-slate-900 rounded text-green-400 font-mono text-xs break-all border border-green-900/30">
                            KEY_FOUND: 8f9a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5o
                          </div>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {/* --- TAB: VOICE FORENSICS --- */}
              {activeTab === 'voice' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-blue-400 font-bold flex items-center"><Mic className="w-4 h-4 mr-2" /> 声纹波形分析</h3>
                        <button onClick={() => triggerUpload('audio')} className="text-[10px] flex items-center bg-slate-800 px-2 py-1 rounded hover:bg-slate-700 text-slate-300">
                          <Upload className="w-3 h-3 mr-1" /> 上传音频
                        </button>
                    </div>
                    <div className="mb-4">
                      <AudioWaveform playing={playing} />
                    </div>
                    <div className="flex items-center space-x-4">
                      <button onClick={() => setPlaying(!playing)} className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white">
                        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs text-slate-400"><span>压力指数</span> <span className="text-red-400">82%</span></div>
                        <div className="w-full h-1 bg-slate-700 rounded-full"><div className="h-full w-[82%] bg-red-500"></div></div>
                      </div>
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        disabled={analyzing || voiceResult}
                        className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold disabled:opacity-50 flex justify-center items-center"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                正在分析声纹谱... {progress}%
                            </>
                        ) : voiceResult ? '分析完成' : '启动声纹比对 (START MATCH)'}
                    </button>
                  </div>
                  
                  <div className={`bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg transition-all duration-500 ${voiceResult ? 'opacity-100 translate-x-0' : 'opacity-50 blur-sm'}`}>
                     <div className="relative">
                        {!voiceResult && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="text-blue-500 font-mono text-xs border border-blue-500/30 bg-black/80 px-4 py-2 rounded animate-pulse">
                                    等待分析指令...
                                </div>
                            </div>
                        )}
                        <h3 className="text-blue-400 font-bold mb-4">声纹匹配结果</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-slate-800 p-3 rounded border-l-2 border-green-500">
                            <span className="text-xs text-slate-200">目标 A</span>
                            <span className="text-xs font-mono text-green-400">98.5% 匹配</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-800 p-3 rounded border-l-2 border-yellow-500">
                            <span className="text-xs text-slate-200">目标 B</span>
                            <span className="text-xs font-mono text-yellow-400">45.2% 匹配</span>
                            </div>
                            <div className="p-3 bg-blue-900/20 rounded border border-blue-500/30 text-xs text-blue-200 mt-4">
                            AI 分析显示音频背景包含特定频率的工业噪音，推测录音地点可能位于港口区域。
                            </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* --- TAB: FACIAL ANALYSIS --- */}
              {activeTab === 'face' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-4">
                        <h3 className="text-green-400 font-bold flex items-center"><ScanFace className="w-4 h-4 mr-2" /> 面部特征重构</h3>
                        <button onClick={() => triggerUpload('image')} className="text-[10px] flex items-center bg-slate-800 px-2 py-1 rounded hover:bg-slate-700 text-slate-300">
                          <Upload className="w-3 h-3 mr-1" /> 上传照片
                        </button>
                    </div>
                    <FaceReconstruction />
                    <div className="mt-4 w-full grid grid-cols-2 gap-2">
                       <div className="bg-black/50 p-2 rounded text-center border border-slate-700">
                         <div className="text-[10px] text-slate-500">匹配对象</div>
                         <div className="text-xs font-bold text-green-400">目标编号 #8921</div>
                       </div>
                       <div className="bg-black/50 p-2 rounded text-center border border-slate-700">
                         <div className="text-[10px] text-slate-500">置信度</div>
                         <div className="text-xs font-bold text-green-400">99.8%</div>
                       </div>
                    </div>
                    <button 
                        onClick={handleAnalyze}
                        disabled={analyzing || faceResult}
                        className="mt-6 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold disabled:opacity-50 flex justify-center items-center"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                正在重构特征... {progress}%
                            </>
                        ) : faceResult ? '重构完成' : '启动面部识别 (START RECON)'}
                    </button>
                  </div>
                  
                  <div className={`bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg transition-all duration-500 ${faceResult ? 'opacity-100 translate-x-0' : 'opacity-50 blur-sm'}`}>
                     <div className="relative">
                        {!faceResult && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="text-purple-500 font-mono text-xs border border-purple-500/30 bg-black/80 px-4 py-2 rounded animate-pulse">
                                    等待面部扫描...
                                </div>
                            </div>
                        )}
                        <h3 className="text-green-400 font-bold mb-4">生物特征详情</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-500">瞳孔间距</div>
                                <div className="text-sm text-slate-200">63mm</div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-500">面部对称性</div>
                                <div className="text-sm text-slate-200">92%</div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-500">颧骨特征</div>
                                <div className="text-sm text-slate-200">高/突出</div>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                                <div className="text-[10px] text-slate-500">微表情检测</div>
                                <div className="text-sm text-red-400">检测到焦虑</div>
                            </div>
                            </div>
                            <div className="p-3 bg-green-900/20 rounded border border-green-500/30 text-xs text-green-200">
                            系统已锁定嫌疑人身份。该面部特征与 2023 年 "Cyber-Heist" 案件主犯高度吻合。建议立即进行轨迹追踪。
                            </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forensics;
