import React, { useRef, useState, useEffect, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize, RefreshCw, Filter, Share2, Shield, AlertTriangle } from 'lucide-react';

// Define Node and Link types
interface GraphNode {
  id: string;
  group: 'suspect' | 'phone' | 'account' | 'location' | 'event' | 'organization';
  label: string;
  val: number; // Size
  level?: number; // Threat level 1-5
  details?: string;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  value: number; // Thickness/Strength
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const KnowledgeGraph: React.FC = () => {
  const fgRef = useRef<ForceGraphMethods>();
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<any>>(new Set());
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dimensions state
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions(); // Initial call
    
    // Slight delay to ensure parent container is ready
    setTimeout(updateDimensions, 100);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    // Adjust Force Graph Physics
    if (fgRef.current) {
      fgRef.current.d3Force('charge')?.strength(-400); // Stronger repulsion to spread nodes
      fgRef.current.d3Force('link')?.distance(150); // Longer links
    }
  }, []);

  // --- MOCK DATA GENERATION ---
  const data: GraphData = useMemo(() => {
    const nodes: GraphNode[] = [
      { id: 'S001', group: 'suspect', label: '张三 (Zhang San)', val: 20, level: 5, details: '主要嫌疑人，涉及多起欺诈案' },
      { id: 'S002', group: 'suspect', label: '李四 (Li Si)', val: 15, level: 4, details: '同伙，负责洗钱' },
      { id: 'P001', group: 'phone', label: '138****1234', val: 10, details: '频繁联系号码' },
      { id: 'P002', group: 'phone', label: '139****5678', val: 10, details: '备用联络号码' },
      { id: 'B001', group: 'account', label: 'ICBC ****8888', val: 12, details: '资金汇入账户' },
      { id: 'B002', group: 'account', label: 'USDT Wallet', val: 12, details: '虚拟货币地址' },
      { id: 'L001', group: 'location', label: '曼谷某公寓', val: 8, details: '最后定位地点' },
      { id: 'L002', group: 'location', label: '缅甸妙瓦底', val: 8, details: '疑似窝点' },
      { id: 'O001', group: 'organization', label: 'Shadow Corp', val: 25, level: 5, details: '跨国犯罪集团核心' },
      { id: 'E001', group: 'event', label: '2.14 交易', val: 8, details: '异常大额转账事件' },
    ];

    const links: GraphLink[] = [
      { source: 'S001', target: 'P001', type: 'OWNER', value: 2 },
      { source: 'S001', target: 'O001', type: 'LEADER', value: 5 },
      { source: 'S002', target: 'P002', type: 'OWNER', value: 2 },
      { source: 'S002', target: 'O001', type: 'MEMBER', value: 3 },
      { source: 'P001', target: 'P002', type: 'CALL', value: 1 },
      { source: 'S001', target: 'B001', type: 'CONTROL', value: 3 },
      { source: 'S002', target: 'B002', type: 'CONTROL', value: 3 },
      { source: 'B001', target: 'B002', type: 'TRANSFER', value: 4 },
      { source: 'P001', target: 'L001', type: 'LOCATED', value: 1 },
      { source: 'P002', target: 'L002', type: 'LOCATED', value: 1 },
      { source: 'B001', target: 'E001', type: 'INVOLVED', value: 2 },
    ];

    return { nodes, links };
  }, []);

  // --- INTERACTION HANDLERS ---
  const handleNodeHover = (node: GraphNode | null) => {
    setHoverNode(node);
    highlightNodes.clear();
    highlightLinks.clear();
    
    if (node) {
      highlightNodes.add(node.id);
      data.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        
        if (sourceId === node.id || targetId === node.id) {
          highlightLinks.add(link);
          highlightNodes.add(sourceId);
          highlightNodes.add(targetId);
        }
      });
    }
    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    fgRef.current?.centerAt(node.x!, node.y!, 1000);
    fgRef.current?.zoom(4, 2000);
  };

  // --- CUSTOM RENDERERS ---
  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { id, x, y, group, val } = node;
    const isHover = highlightNodes.has(id);
    const isSelected = selectedNode?.id === id;
    
    // Base colors
    const colors: Record<string, string> = {
      suspect: '#ef4444', // Red
      phone: '#3b82f6', // Blue
      account: '#10b981', // Emerald
      location: '#f59e0b', // Amber
      event: '#a855f7', // Purple
      organization: '#ec4899', // Pink
    };
    const color = colors[group] || '#94a3b8';

    // Draw Glow
    if (isHover || isSelected) {
      ctx.beginPath();
      ctx.arc(x, y, val * 1.5, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw Core Shape (Hexagon for Suspect/Org, Circle for others)
    ctx.beginPath();
    if (group === 'suspect' || group === 'organization') {
        // Hexagon
        for (let i = 0; i < 6; i++) {
            const angle = 2 * Math.PI / 6 * i;
            const hx = x + val * Math.cos(angle);
            const hy = y + val * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
    } else {
        // Circle
        ctx.arc(x, y, val, 0, 2 * Math.PI, false);
    }
    
    ctx.fillStyle = '#0f172a'; // Slate-900 center
    ctx.fill();
    ctx.lineWidth = isSelected ? 2 : 1.5;
    ctx.strokeStyle = color;
    ctx.stroke();

    // Inner Dot
    ctx.beginPath();
    ctx.arc(x, y, val * 0.4, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // Label (Only show on hover or high zoom)
    if (globalScale > 1.5 || isHover || isSelected) {
      const label = node.label;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isHover ? '#fff' : 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(label, x, y + val + 8);
    }
  };

  const paintLink = (link: any, ctx: CanvasRenderingContext2D) => {
    // Custom link drawing if needed, otherwise default is fine.
    // We rely on default but change color dynamically in props
  };

  return (
    <div className="flex h-full w-full bg-slate-950 relative overflow-hidden">
      {/* TOOLBAR */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700 backdrop-blur shadow-xl">
           <div className="text-xs font-bold text-slate-400 mb-2 px-1">工具 (TOOLS)</div>
           <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-blue-400" title="Zoom In" onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.2, 500)}>
             <ZoomIn className="w-4 h-4" />
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-blue-400" title="Zoom Out" onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.2, 500)}>
             <ZoomOut className="w-4 h-4" />
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-amber-400" title="Fit View" onClick={() => fgRef.current?.zoomToFit(500, 50)}>
             <Maximize className="w-4 h-4" />
           </button>
           <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 text-green-400" title="Refresh" onClick={() => { fgRef.current?.d3ReheatSimulation(); }}>
             <RefreshCw className="w-4 h-4" />
           </button>
        </div>

        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-700 backdrop-blur shadow-xl">
           <div className="text-xs font-bold text-slate-400 mb-2 px-1">图例 (LEGEND)</div>
           <div className="space-y-1">
             <div className="flex items-center text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>嫌疑人 (Suspect)</div>
             <div className="flex items-center text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>通讯 (Phone)</div>
             <div className="flex items-center text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>资金 (Finance)</div>
             <div className="flex items-center text-[10px] text-slate-300"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>位置 (Location)</div>
           </div>
        </div>
      </div>

      {/* GRAPH CANVAS */}
      <div ref={containerRef} className="flex-1 h-full cursor-move bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeLabel="label"
          nodeVal="val"
          
          // Style
          backgroundColor="rgba(0,0,0,0)" // Transparent to show background pattern
          linkColor={link => highlightLinks.has(link) ? '#fff' : '#334155'} // White if highlight, else slate-700
          linkWidth={link => highlightLinks.has(link) ? 3 : 1}
          linkDirectionalParticles={link => highlightLinks.has(link) ? 4 : 2} // More particles on highlight
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.005}
          
          // Interaction
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedNode(null)}
          
          // Custom Rendering
          nodeCanvasObject={paintNode}
          
          // Physics
          d3VelocityDecay={0.4} // Lower friction to let it spread
          cooldownTicks={200}
        />
      </div>

      {/* RIGHT: DETAILS PANEL */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-72 bg-slate-900/95 border border-amber-500/50 rounded-xl p-0 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-right-10 overflow-hidden z-20">
           {/* Header */}
           <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-start">
             <div>
               <h3 className="text-lg font-bold text-white flex items-center">
                 {selectedNode.group === 'suspect' && <Shield className="w-5 h-5 mr-2 text-red-500" />}
                 {selectedNode.group === 'phone' && <Share2 className="w-5 h-5 mr-2 text-blue-500" />}
                 {selectedNode.label}
               </h3>
               <span className="text-xs font-mono text-amber-500 bg-amber-900/20 px-2 py-0.5 rounded border border-amber-500/30 mt-1 inline-block">
                 ID: {selectedNode.id}
               </span>
             </div>
             <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white">✕</button>
           </div>

           {/* Content */}
           <div className="p-4 space-y-4">
             <div>
               <label className="text-xs text-slate-500 font-bold uppercase">Type / 类型</label>
               <div className="text-sm text-slate-300 capitalize">{selectedNode.group}</div>
             </div>
             
             <div>
               <label className="text-xs text-slate-500 font-bold uppercase">Description / 描述</label>
               <div className="text-sm text-slate-300 bg-slate-950/50 p-2 rounded border border-slate-800 mt-1">
                 {selectedNode.details}
               </div>
             </div>

             {selectedNode.level && (
               <div>
                 <label className="text-xs text-slate-500 font-bold uppercase">Threat Level / 威胁等级</label>
                 <div className="flex items-center mt-1 space-x-1">
                   {[1, 2, 3, 4, 5].map(lvl => (
                     <div 
                       key={lvl} 
                       className={`h-2 flex-1 rounded-sm ${lvl <= (selectedNode.level || 0) ? 'bg-red-500' : 'bg-slate-700'}`}
                     ></div>
                   ))}
                 </div>
                 <div className="text-right text-xs text-red-500 font-mono mt-1">LEVEL {selectedNode.level}</div>
               </div>
             )}

             <div className="pt-2 border-t border-slate-800 flex space-x-2">
               <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-xs font-bold transition-colors">
                 追踪轨迹
               </button>
               <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-xs font-bold transition-colors">
                 导出报告
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
