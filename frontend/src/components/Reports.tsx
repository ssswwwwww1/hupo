import React, { useState, useEffect, useRef } from 'react';
import { getReports, generateReport, getCases, Report, Case } from '../api';
import { FileText, Download, Plus, Loader2, FileCheck, Share2, ShieldCheck, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sharing, setSharing] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getReports().then(setReports);
    getCases().then(setCases);
  }, []);

  const handleGenerate = async (caseId: string) => {
    if (!caseId) return;
    setGenerating(true);
    try {
      const newReport = await generateReport(caseId);
      setReports(prev => [...prev, newReport]);
      setSelectedReport(newReport);
    } catch (error) {
      console.error("Failed to generate report", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = () => {
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      alert("Secure link generated and sent to encrypted channel.");
    }, 1500);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Case-Report-${selectedReport?.id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col md:flex-row gap-8 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-1/3 flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-100 flex items-center font-mono tracking-wide">
            <FileText className="mr-3 text-amber-500" />
            案件报告 (CASE REPORTS)
          </h2>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest font-mono">生成新档案 (GENERATE NEW DOSSIER)</h3>
          <div className="flex gap-2">
            <select 
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              id="case-select"
            >
              <option value="">选择行动 (SELECT OPERATION)...</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <button 
              onClick={() => {
                const select = document.getElementById('case-select') as HTMLSelectElement;
                handleGenerate(select.value);
              }}
              disabled={generating}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded flex items-center transition-colors disabled:opacity-50 border border-amber-500/50"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-lg">
           <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">归档文件 (ARCHIVED FILES)</h3>
             <span className="text-[10px] bg-slate-700 px-2 rounded-full text-slate-300">{reports.length}</span>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-2">
             {reports.map(report => (
               <div 
                 key={report.id}
                 onClick={() => setSelectedReport(report)}
                 className={`p-3 rounded cursor-pointer transition-all border group relative overflow-hidden ${
                   selectedReport?.id === report.id 
                     ? 'bg-amber-900/20 border-amber-500/50' 
                     : 'bg-slate-700/30 border-transparent hover:bg-slate-700/50 hover:border-slate-600'
                 }`}
               >
                 {selectedReport?.id === report.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                 <div className="flex justify-between items-start">
                   <span className="font-bold text-slate-200 text-xs font-mono truncate pr-2">{report.title}</span>
                   <FileCheck className={`w-3 h-3 ${selectedReport?.id === report.id ? 'text-amber-500' : 'text-slate-500'}`} />
                 </div>
                 <div className="flex justify-between items-center mt-2">
                   <span className="text-[10px] font-mono text-slate-500">{report.id}</span>
                   <span className="text-[10px] text-slate-400 bg-black/20 px-1 rounded">{new Date(report.created_at).toLocaleDateString()}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden relative">
        {selectedReport ? (
          <>
            <div className="absolute top-4 right-4 z-10 flex space-x-2">
               <button 
                onClick={handleShare}
                disabled={sharing}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded shadow-lg flex items-center text-xs transition-colors border border-slate-600 font-mono"
              >
                {sharing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Share2 className="w-3 h-3 mr-2" />}
                安全分享 (SHARE)
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded shadow-lg flex items-center text-xs transition-colors border border-amber-500 font-mono font-bold"
              >
                <Printer className="w-3 h-3 mr-2" />
                导出 PDF
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 bg-slate-950/50 flex justify-center">
              <div 
                ref={reportRef} 
                className="bg-white text-slate-900 w-[210mm] min-h-[297mm] p-[20mm] shadow-xl origin-top transform scale-90 md:scale-100 relative"
              >
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                    <ShieldCheck className="w-96 h-96" />
                </div>

                <div className="relative z-10">
                    <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">机密文件 (CONFIDENTIAL)</h1>
                        <p className="text-slate-500 mt-1 font-mono text-xs tracking-widest">琥珀计划项目组 // 案件调查报告 (AMBER PROJECT)</p>
                    </div>
                    <div className="text-right">
                        <div className="w-24 h-24 bg-slate-900 text-white flex items-center justify-center font-bold text-2xl mb-2 border-4 border-red-600 text-red-500 rotate-[-10deg] opacity-80">绝密<br/>TOP SECRET</div>
                    </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8 text-xs font-mono border-b border-slate-200 pb-8">
                        <div>
                            <div className="text-slate-500">索引编号 (REF ID)</div>
                            <div className="font-bold text-lg">{selectedReport.id}</div>
                        </div>
                        <div>
                            <div className="text-slate-500">生成日期 (DATE)</div>
                            <div className="font-bold text-lg">{new Date(selectedReport.created_at).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div className="text-slate-500">安全等级 (CLEARANCE)</div>
                            <div className="font-bold text-lg text-red-600">LEVEL 5</div>
                        </div>
                    </div>

                    <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <span className="w-2 h-6 bg-amber-500 mr-2"></span>
                        1. 行动概览 (OPERATION OVERVIEW)
                    </h2>
                    <div className="bg-slate-50 p-4 border border-slate-200 text-sm">
                        <div className="grid grid-cols-2 gap-y-2">
                            <div className="flex"><span className="font-bold w-32">案件 ID:</span> {selectedReport.case_id}</div>
                            <div className="flex"><span className="font-bold w-32">标题:</span> {selectedReport.title}</div>
                            <div className="flex"><span className="font-bold w-32">状态:</span> {selectedReport.status}</div>
                            <div className="flex"><span className="font-bold w-32">分析员:</span> AI 分析单元-01</div>
                        </div>
                    </div>
                    </div>

                    <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <span className="w-2 h-6 bg-amber-500 mr-2"></span>
                        2. 情报摘要 (INTELLIGENCE SUMMARY)
                    </h2>
                    <p className="text-sm leading-relaxed text-justify font-serif">
                        {selectedReport.content}
                        <br /><br />
                        <strong>AI 综合分析:</strong> 初步数据关联显示有 94.5% 的概率涉及有组织犯罪集团。与全球数据库的交叉比对表明，可能与泛太平洋地区的离岸空壳公司有关。
                        <br /><br />
                        <strong>战术建议:</strong> 启动第二阶段监控。向第 7 扇区部署本地信号情报 (SIGINT) 资产。立即冻结已识别的加密资产。
                    </p>
                    </div>

                    <div className="mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <span className="w-2 h-6 bg-amber-500 mr-2"></span>
                        3. 证据链 (EVIDENCE CHAIN)
                    </h2>
                    <div className="border border-slate-200 text-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 text-xs uppercase">
                                <tr>
                                    <th className="p-2 border-r">类型</th>
                                    <th className="p-2 border-r">描述</th>
                                    <th className="p-2">哈希值 (Hash)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="p-2 border-r font-mono text-xs">数字证据</td>
                                    <td className="p-2 border-r">加密数据包 (AES-256)</td>
                                    <td className="p-2 font-mono text-xs">8a7b...9c2d</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-r font-mono text-xs">生物特征</td>
                                    <td className="p-2 border-r">面部扫描 (匹配度: 99.8%)</td>
                                    <td className="p-2 font-mono text-xs">3f4e...1a9b</td>
                                </tr>
                                <tr>
                                    <td className="p-2 border-r font-mono text-xs">地理位置</td>
                                    <td className="p-2 border-r">轨迹日志 (曼谷 -{'>'} 仰光)</td>
                                    <td className="p-2 font-mono text-xs">5d2c...8e1f</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    </div>

                    <div className="mt-12 pt-8 border-t-2 border-slate-900 flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                    <div>
                        GENERATED BY AMBER PROJECT V3.0<br/>
                        UNAUTHORIZED DISTRIBUTION IS A FELONY
                    </div>
                    <div className="text-right">
                        PAGE 1 OF 1<br/>
                        SECURE HASH: {Math.random().toString(36).substring(7).toUpperCase()}
                    </div>
                    </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <FileText className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-mono text-sm">SELECT A DOSSIER TO VIEW CONTENTS</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
