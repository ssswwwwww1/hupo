import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera, Environment, useGLTF, Center, Html } from '@react-three/drei';
import * as THREE from 'three';
import { analyzeScene, AnalysisResult } from '../api';
import { Loader2, Box, RotateCw, Grid as GridIcon, Maximize, ZoomIn, ZoomOut, Eye, ArrowUp, ArrowDown, ShieldAlert, Scan, FileText, Activity } from 'lucide-react';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';

// ... (keep Room and HolographicSuspect)

const Room = () => {
  return (
    <group>
    </group>
  );
};

const HolographicSuspect = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.3, 1.7, 8, 16]} />
        <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Inner Core */}
      <mesh>
        <capsuleGeometry args={[0.15, 1.6, 4, 8]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.1, 0]}>
         <sphereGeometry args={[0.2, 16, 16]} />
         <meshBasicMaterial color="#ef4444" wireframe />
      </mesh>
      {/* Scanning Rings */}
      <mesh rotation={[Math.PI/2, 0, 0]} position={[0, -0.8, 0]}>
        <ringGeometry args={[0.4, 0.45, 32]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>
      <Text position={[0, 2.3, 0]} fontSize={0.15} color="#ef4444" outlineWidth={0.01} outlineColor="black">
        SUSPECT TARGET (ID: 9527)
      </Text>
    </group>
  );
};

const ModelScanner = ({ active }: { active: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && active) {
      // Move scan plane up and down
      const t = state.clock.elapsedTime * 1;
      meshRef.current.position.y = Math.sin(t) * 3 + 1; // Range -2 to 4, centered at 1
    }
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1, 0]}>
      <planeGeometry args={[6, 6]} />
      <meshBasicMaterial 
        color="#f59e0b" 
        transparent 
        opacity={0.2} 
        side={THREE.DoubleSide}
        depthWrite={false}
      />
      <mesh position={[0, 0, 0.01]}>
         <ringGeometry args={[0, 3, 32]} />
         <meshBasicMaterial color="#f59e0b" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </mesh>
  );
};

// Update SceneModel to accept props
const fitScene = (scene: THREE.Object3D, targetSize = 6) => {
  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / maxDim;
  scene.scale.setScalar(scale);
  // Recompute after scaling
  const scaledBox = new THREE.Box3().setFromObject(scene);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  scene.position.sub(center);
  // Lift so the bottom rests on y=0
  const finalBox = new THREE.Box3().setFromObject(scene);
  scene.position.y -= finalBox.min.y;
};

const GltfModel = ({ path, wireframe }: { path: string; wireframe: boolean }) => {
  const gltf = useGLTF(path);
  const scene = React.useMemo(() => gltf.scene.clone(), [gltf.scene]);
  React.useEffect(() => {
    fitScene(scene);
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (wireframe) {
          if (!mesh.userData.originalMaterial) {
            mesh.userData.originalMaterial = mesh.material;
          }
          mesh.material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.3
          });
        } else {
          if (mesh.userData.originalMaterial) {
            mesh.material = mesh.userData.originalMaterial;
          }
        }
      }
    });
  }, [wireframe, scene]);
  return <primitive object={scene} />;
};

const DaeModel = ({ path, wireframe }: { path: string; wireframe: boolean }) => {
  const collada = useLoader(ColladaLoader as any, path) as any;
  const scene = React.useMemo(() => collada.scene.clone(), [collada.scene]);
  React.useEffect(() => {
    fitScene(scene);
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (wireframe) {
          if (!mesh.userData.originalMaterial) {
            mesh.userData.originalMaterial = mesh.material;
          }
          mesh.material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true,
            opacity: 0.3
          });
        } else {
          if (mesh.userData.originalMaterial) {
            mesh.material = mesh.userData.originalMaterial;
          }
        }
      }
    });
  }, [wireframe, scene]);
  return <primitive object={scene} />;
};

const SceneModel = ({ wireframe }: { wireframe: boolean }) => {
  const [mode, setMode] = React.useState<'gltf' | 'fallback' | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const resGlb = await fetch('/models/old_city.glb', { method: 'HEAD' });
        if (resGlb.ok) {
          setMode('gltf');
          return;
        }
      } catch {}
      setMode('fallback');
    })();
  }, []);
  if (mode === null) return null;
  if (mode === 'gltf') return <GltfModel path="/models/old_city.glb" wireframe={wireframe} />;
  return <GltfModel path="/models/guest_room.glb" wireframe={wireframe} />;
};

const ObjectMarker = ({ position, label, type }: { position: [number, number, number], label: string, type: string }) => {
  const [hovered, setHovered] = useState(false);
  
  const color = type === 'evidence' ? '#ef4444' : type === 'device' ? '#3b82f6' : '#f59e0b';

  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div 
          className={`transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${hovered ? 'scale-110 z-50' : 'scale-100 z-0'}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className={`w-4 h-4 rounded-full border-2 ${hovered ? 'bg-opacity-100' : 'bg-opacity-50'} animate-pulse`} style={{ borderColor: color, backgroundColor: color }}></div>
          {hovered && (
            <div className="absolute left-6 top-0 bg-slate-900/90 border border-slate-600 p-2 rounded w-48 backdrop-blur-md">
              <div className="text-xs font-bold uppercase" style={{ color }}>{type}</div>
              <div className="text-sm text-white font-mono">{label}</div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

const SceneViewer: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'objects' | 'anomalies'>('overview');
  
  // Viewer Controls State
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [fov, setFov] = useState(50);
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([5, 5, 5]);
  const controlsRef = useRef<any>(null);

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setFov(50);
    setCameraPosition([5, 5, 5]);
  };

  const handleZoomIn = () => setFov(Math.max(20, fov - 5));
  const handleZoomOut = () => setFov(Math.min(100, fov + 5));

  const handleMoveUp = () => {
    setCameraPosition(prev => [prev[0], prev[1] + 1, prev[2]]);
  };

  const handleMoveDown = () => {
    setCameraPosition(prev => [prev[0], Math.max(1, prev[1] - 1), prev[2]]);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const data = await analyzeScene('SCENE-001');
      setResult(data);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-black">
      {/* Left Panel - Analysis */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 rounded-lg backdrop-blur border border-amber-500/30 w-96 shadow-2xl flex flex-col max-h-[calc(100%-2rem)]">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold text-amber-500 mb-1 flex items-center tracking-wider">
            <Box className="w-5 h-5 mr-2" />
            3D 现场还原 (SCENE RECON)
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            AI-ENHANCED FORENSIC ANALYSIS SYSTEM v3.0
          </p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {!result ? (
             <div className="flex flex-col items-center justify-center h-40 text-slate-500">
               <Scan className="w-12 h-12 mb-2 opacity-50" />
               <p>等待启动分析...</p>
             </div>
          ) : (
            <div className="space-y-4">
               {/* Risk Score */}
               <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700">
                 <div>
                   <div className="text-xs text-slate-400 uppercase">Risk Assessment</div>
                   <div className={`text-2xl font-bold font-mono ${result.risk_score > 0.8 ? 'text-red-500' : 'text-amber-500'}`}>
                     {(result.risk_score * 100).toFixed(1)}%
                   </div>
                 </div>
                 <ShieldAlert className={`w-8 h-8 ${result.risk_score > 0.8 ? 'text-red-500' : 'text-amber-500'}`} />
               </div>

               {/* Tabs */}
               <div className="flex border-b border-slate-700 mb-2">
                 <button 
                   onClick={() => setActiveTab('overview')}
                   className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${activeTab === 'overview' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                   Overview
                 </button>
                 <button 
                   onClick={() => setActiveTab('objects')}
                   className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${activeTab === 'objects' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                   Objects ({result.objects?.length || 0})
                 </button>
                 <button 
                   onClick={() => setActiveTab('anomalies')}
                   className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${activeTab === 'anomalies' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                   Anomalies ({result.anomalies?.length || 0})
                 </button>
               </div>

               {/* Tab Content */}
               {activeTab === 'overview' && (
                 <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
                     <div className="text-xs text-amber-500 uppercase font-bold mb-1 flex items-center">
                       <FileText className="w-3 h-3 mr-1" /> Summary
                     </div>
                     <p className="text-xs text-slate-300 leading-relaxed">{result.summary}</p>
                   </div>
                   
                   <div className="bg-slate-800/30 p-3 rounded border border-slate-700">
                     <div className="text-xs text-blue-400 uppercase font-bold mb-1 flex items-center">
                       <Activity className="w-3 h-3 mr-1" /> Timeline
                     </div>
                     <ul className="space-y-2 mt-2">
                      {result.timeline.map((t, i) => (
                        <li key={i} className="flex gap-2 text-xs">
                          <span className="font-mono text-amber-500/80 whitespace-nowrap">{t.time.split(' ')[1]}</span>
                          <span className="text-slate-300">{t.event}</span>
                        </li>
                      ))}
                    </ul>
                   </div>
                 </div>
               )}

               {activeTab === 'objects' && (
                 <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                   {result.objects?.map((obj) => (
                     <div key={obj.id} className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-slate-700 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                       <div>
                         <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">{obj.name}</div>
                         <div className="text-[10px] text-slate-500 uppercase">{obj.type} • ID: {obj.id}</div>
                       </div>
                       <div className="text-xs font-mono text-emerald-500">{(obj.confidence * 100).toFixed(0)}%</div>
                     </div>
                   ))}
                 </div>
               )}

               {activeTab === 'anomalies' && (
                 <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                   {result.anomalies?.map((anom) => (
                     <div key={anom.id} className="p-2 bg-red-900/10 rounded border border-red-900/30 hover:bg-red-900/20 transition-colors">
                       <div className="flex justify-between items-start mb-1">
                         <div className="text-xs font-bold text-red-400">{anom.description}</div>
                         <span className="text-[10px] px-1 bg-red-900/50 text-red-200 rounded uppercase">{anom.severity}</span>
                       </div>
                       <div className="text-[10px] text-slate-500 font-mono">ID: {anom.id}</div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded font-bold flex items-center justify-center transition-all disabled:opacity-50 shadow-lg border border-amber-500/50 text-sm uppercase tracking-wide"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                System Scanning...
              </>
            ) : (
              'Initiate AI Scan'
            )}
          </button>
        </div>
      </div>

      {/* Right Panel - Viewer Controls */}
      <div className="absolute top-4 right-4 z-10 bg-slate-900/80 p-2 rounded-lg backdrop-blur border border-slate-700 shadow-xl flex flex-col gap-2">
        <button 
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded hover:bg-slate-700 transition-colors ${autoRotate ? 'text-amber-500 bg-slate-800' : 'text-slate-400'}`}
          title="自动旋转 (Auto Rotate)"
        >
          <RotateCw className={`w-5 h-5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
        </button>
        <button 
          onClick={() => setWireframe(!wireframe)}
          className={`p-2 rounded hover:bg-slate-700 transition-colors ${wireframe ? 'text-green-500 bg-slate-800' : 'text-slate-400'}`}
          title="线框模式 (Wireframe Mode)"
        >
          <GridIcon className="w-5 h-5" />
        </button>
        <div className="h-px bg-slate-700 my-1" />
        <button 
          onClick={handleZoomIn}
          className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="放大 (Zoom In)"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="缩小 (Zoom Out)"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <div className="h-px bg-slate-700 my-1" />
        <button 
          onClick={handleMoveUp}
          className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="升高视角 (Move Camera Up)"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <button 
          onClick={handleMoveDown}
          className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="降低视角 (Move Camera Down)"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div className="h-px bg-slate-700 my-1" />
        <button 
          onClick={handleResetView}
          className="p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="重置视角 (Reset View)"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative">
        <Canvas 
          key={analyzing ? 'analyzing' : 'idle'} 
          camera={{ position: cameraPosition, fov: fov }}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)]}
        >
          <PerspectiveCamera makeDefault position={cameraPosition} fov={fov} />
          <color attach="background" args={['#101010']} />
          
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <pointLight position={[-5, 5, -5]} intensity={1} color="#3b82f6" />
          
          <Environment preset="city" />
          
          <group position={[0, -1, 0]}>
            <Room />
            <Suspense fallback={<Html center><div className="text-slate-300 bg-black/70 px-3 py-2 rounded border border-slate-600 text-xs font-mono">加载城市模型中...</div></Html>}>
               <SceneModel wireframe={wireframe} />
            </Suspense>
            
            <ModelScanner active={analyzing} />
            
            <HolographicSuspect position={[1, 0, 1]} />

            {/* Display Object Markers when result is available */}
            {result && result.objects?.map((obj) => (
              <ObjectMarker 
                key={obj.id} 
                position={[obj.coordinates[0], obj.coordinates[1], obj.coordinates[2]] as [number, number, number]} 
                label={obj.name}
                type={obj.type}
              />
            ))}
          </group>

          <OrbitControls 
            ref={controlsRef}
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2} 
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enablePan={true}
            screenSpacePanning={true}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default SceneViewer;
