import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getCases, getTrajectory, Case, TrajectoryPoint } from '../api';
import { getRelatedCases, RelatedCaseInfo } from '../chatApi';
import L from 'leaflet';
import { Play, Pause, RotateCcw, Calendar, AlertTriangle, Globe, Radio, Crosshair, Map as MapIcon, Satellite, Scan, Navigation } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- Orbital Recon Components (Moved Here) ---

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.07;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg')}
          specularMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg')}
          bumpMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg')}
          bumpScale={0.05}
          specular={new THREE.Color('grey')}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshPhongMaterial 
          map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png')}
          transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.1, 64, 64]} />
        <meshPhongMaterial color="#3b82f6" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

const Satellites = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.05) * 0.2;
    }
  });
  return (
    <group ref={groupRef}>
      {[...Array(8)].map((_, i) => (
        <group key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
          <mesh position={[2.5 + Math.random(), 0, 0]}>
            <boxGeometry args={[0.05, 0.05, 0.1]} />
            <meshBasicMaterial color="#f59e0b" />
            <Html distanceFactor={10}>
              <div className="text-[8px] text-amber-500 font-mono whitespace-nowrap bg-black/50 px-1 border border-amber-500/30">
                SAT-{100 + i}
              </div>
            </Html>
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <ringGeometry args={[2.5 + Math.random(), 2.51 + Math.random(), 64]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.1} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// --- End Orbital Components ---

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
} as L.IconOptions);

L.Marker.prototype.options.icon = DefaultIcon;

const IntelTicker = () => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-slate-950/95 border-t border-amber-500/30 text-amber-500 font-mono text-xs py-1.5 overflow-hidden z-[1000] flex items-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
      <div className="px-4 font-bold bg-amber-900/20 h-full flex items-center border-r border-amber-500/30">
        <Radio className="w-3 h-3 mr-2 animate-pulse" />
        INTEL FEED
      </div>
      <div className="flex-1 overflow-hidden relative h-4">
        <div className="absolute whitespace-nowrap animate-marquee flex space-x-12">
          <span>⚠️ DARK WEB PACKET SPIKE DETECTED [LEVEL 5]</span>
          <span>📡 SATELLITE UPLINK ESTABLISHED: SE-ASIA REGION</span>
          <span>💸 ANOMALOUS CRYPTO TRANSFER INTERCEPTED: 500 BTC {'>'} WALLET_X</span>
          <span>👤 SUSPECT 'COBRA' SIGHTED AT BORDER CONTROL POINT 4</span>
          <span>🔄 NEURAL NETWORK SYNCING GLOBAL DATABASE... [98%]</span>
        </div>
      </div>
    </div>
  );
};

const TacticalHUD = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-[999]">
      {/* Corner Brackets */}
      <div className="absolute top-4 left-4 w-24 h-24 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-24 h-24 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg"></div>
      <div className="absolute bottom-12 left-4 w-24 h-24 border-b-2 border-l-2 border-amber-500/50 rounded-bl-lg"></div>
      <div className="absolute bottom-12 right-4 w-24 h-24 border-b-2 border-r-2 border-amber-500/50 rounded-br-lg"></div>
      
      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      
      {/* Compass Strip */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-96 h-8 bg-slate-900/80 border border-slate-700 flex justify-between px-2 items-center text-[10px] font-mono text-slate-400">
         <span>270° W</span>
         <span>|</span>
         <span>300° NW</span>
         <span>|</span>
         <span className="text-amber-500 font-bold">330° NNW</span>
         <span>|</span>
         <span>0° N</span>
      </div>

      {/* Status Indicators */}
      <div className="absolute top-6 right-20 flex space-x-4">
        <div className="flex items-center text-xs font-mono text-green-500 bg-black/80 px-2 py-1 rounded border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          <Globe className="w-3 h-3 mr-1 animate-pulse" />
          SAT_LINK: ONLINE
        </div>
        <div className="flex items-center text-xs font-mono text-amber-500 bg-black/80 px-2 py-1 rounded border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          <Radio className="w-3 h-3 mr-1" />
          FREQ: 104.5 MHz
        </div>
      </div>
    </div>
  );
};

const CaseMap: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [relatedCases, setRelatedCases] = useState<RelatedCaseInfo[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  // Live Targets Mock Data
  const [liveTargets, setLiveTargets] = useState([
    { id: 'T1', name: 'TARGET_ALPHA', lat: 18.7, lng: 99.0, color: '#ef4444' }, // Chiang Mai
    { id: 'T2', name: 'TARGET_BRAVO', lat: 13.75, lng: 100.5, color: '#f59e0b' }, // Bangkok
  ]);

  // Mock Geofence Data
  const geofencePolygon = [
    [18.8, 98.9],
    [18.8, 99.1],
    [18.6, 99.1],
    [18.6, 98.9]
  ];

  useEffect(() => {
    // Simulate live movement
    const interval = setInterval(() => {
      setLiveTargets(prev => prev.map(t => ({
        ...t,
        lat: t.lat + (Math.random() - 0.5) * 0.01,
        lng: t.lng + (Math.random() - 0.5) * 0.01
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getCases().then(setCases);
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      // Fetch trajectory
      getTrajectory(selectedCaseId).then(data => {
        setTrajectory(data.points);
        setCurrentIndex(0);
        setIsPlaying(false);
      });
      
      // Fetch related cases
      getRelatedCases(selectedCaseId).then(setRelatedCases);
    } else {
      setTrajectory([]);
      setRelatedCases([]);
    }
  }, [selectedCaseId]);

  useEffect(() => {
    if (isPlaying && trajectory.length > 0) {
      playbackRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= trajectory.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (playbackRef.current) clearInterval(playbackRef.current);
    }
    return () => {
      if (playbackRef.current) clearInterval(playbackRef.current);
    };
  }, [isPlaying, trajectory]);

  const handlePlayPause = () => {
    if (currentIndex >= trajectory.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const getCaseById = (id: string) => cases.find(c => c.id === id);

  return (
    <div className="h-full w-full relative flex overflow-hidden bg-slate-950">
      <TacticalHUD />
      <IntelTicker />
      
      {/* View Toggle */}
      <div className="absolute top-6 right-6 z-[1000] flex space-x-2">
         <button 
           onClick={() => setViewMode('2D')}
           className={`px-3 py-1.5 rounded border font-mono text-xs flex items-center transition-all ${viewMode === '2D' ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_10px_#d97706]' : 'bg-slate-900/80 border-slate-600 text-slate-400 hover:bg-slate-800'}`}
         >
           <MapIcon className="w-3 h-3 mr-1" /> 2D MAP
         </button>
         <button 
           onClick={() => setViewMode('3D')}
           className={`px-3 py-1.5 rounded border font-mono text-xs flex items-center transition-all ${viewMode === '3D' ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_#2563eb]' : 'bg-slate-900/80 border-slate-600 text-slate-400 hover:bg-slate-800'}`}
         >
           <Globe className="w-3 h-3 mr-1" /> 3D ORBIT
         </button>
      </div>

      {/* Control Panel - Floating Left */}
      <div className="absolute top-4 left-4 z-[1000] w-80 space-y-4 pointer-events-none">
        {/* Main Selector */}
        <div className="tech-panel p-4 rounded-sm pointer-events-auto">
          <h3 className="font-bold text-amber-500 mb-4 text-sm flex items-center tracking-wider font-mono border-b border-slate-800 pb-2">
             <Satellite className="mr-2 w-4 h-4 animate-spin-slow" />
             GLOBAL_TRACKING
          </h3>
          
          <div className="mb-4">
            <label className="text-[10px] text-slate-500 block mb-1 font-mono uppercase">Select Target Case</label>
            <div className="relative">
                <select 
                className="w-full bg-slate-900/50 border border-slate-600 rounded-sm p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono appearance-none"
                onChange={(e) => setSelectedCaseId(e.target.value || null)}
                value={selectedCaseId || ''}
                >
                <option value="">-- GLOBAL VIEW MODE --</option>
                {cases.map(c => (
                    <option key={c.id} value={c.id}>[{c.id}] {c.title.toUpperCase()}</option>
                ))}
                </select>
                <div className="absolute right-2 top-2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          {/* Live Targets List */}
          <div className="bg-slate-900/50 p-3 rounded-sm border border-slate-700 mb-4">
             <div className="text-[10px] text-red-500 font-bold mb-2 flex items-center animate-pulse font-mono uppercase">
               <Crosshair className="w-3 h-3 mr-1" /> LIVE TARGETS DETECTED
             </div>
             <div className="space-y-1">
               {liveTargets.map(t => (
                 <div key={t.id} className="flex justify-between items-center text-[10px] text-slate-300 font-mono bg-black/40 p-1.5 rounded border border-slate-800 hover:border-red-500/50 transition-colors">
                    <span>{t.name}</span>
                    <span className="text-amber-500">{t.lat.toFixed(4)}, {t.lng.toFixed(4)}</span>
                 </div>
               ))}
             </div>
          </div>

          {selectedCaseId && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <div className="bg-slate-900/50 p-3 rounded-sm border border-slate-700">
                <div className="text-[10px] text-amber-500 font-bold mb-2 uppercase font-mono">Trajectory Controls</div>
                <div className="flex items-center space-x-2 mb-2">
                  <button 
                    onClick={handlePlayPause}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-1.5 rounded-sm text-xs font-mono transition-colors flex justify-center items-center"
                  >
                    {isPlaying ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                    {isPlaying ? 'PAUSE' : 'PLAY'}
                  </button>
                  <button 
                    onClick={handleReset}
                    className="bg-slate-700 hover:bg-slate-600 text-white p-1.5 rounded-sm transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
                {trajectory.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-400 bg-black/40 p-2 rounded border border-slate-800">
                    <div className="flex justify-between"><span>TIME:</span> <span className="text-slate-200">{new Date(trajectory[currentIndex].timestamp).toLocaleTimeString()}</span></div>
                    <div className="flex justify-between mt-1"><span>ACT:</span> <span className="text-blue-400">{trajectory[currentIndex].activity}</span></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Cases Panel */}
        {selectedCaseId && relatedCases.length > 0 && (
          <div className="tech-panel p-4 rounded-sm pointer-events-auto animate-in fade-in slide-in-from-left-8">
            <h4 className="font-bold text-blue-400 mb-3 text-xs flex items-center font-mono uppercase tracking-wider">
              <Calendar className="mr-2 w-3 h-3" />
              Historical Correlations
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-900">
              {relatedCases.map((rc, idx) => (
                <div key={idx} className="bg-slate-900/80 p-2 rounded-sm border-l-2 border-blue-500 relative overflow-hidden group hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-200 truncate max-w-[120px]">{rc.title}</span>
                    <span className="text-[9px] bg-blue-900/30 text-blue-300 px-1 rounded border border-blue-500/30 font-mono">{rc.case_id}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mb-1 flex items-center">
                    <Scan className="w-3 h-3 mr-1 text-amber-500" />
                    {rc.reason}
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-800 pt-1 mt-1">
                    <span>{rc.time_gap}</span>
                    <span className="text-blue-400">MATCH: {(rc.similarity_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 2D MAP VIEW */}
      {viewMode === '2D' && (
        <MapContainer center={[20, 100]} zoom={4} style={{ height: '100%', width: '100%' }} className="z-0 bg-slate-950">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="filter invert hue-rotate-180 brightness-90 contrast-125 saturate-50 opacity-40" 
          />
          
          {/* Geofence Layer */}
          <Polygon 
            positions={geofencePolygon as any} 
            pathOptions={{ 
              color: '#ef4444', 
              fillColor: '#ef4444', 
              fillOpacity: 0.1, 
              dashArray: '5, 5',
              weight: 2
            }} 
          >
            <Popup>
              <div className="text-xs font-mono text-red-600 font-bold">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                RESTRICTED ZONE (GEOFENCE)
              </div>
            </Popup>
          </Polygon>
          
          {/* Live Targets Markers */}
          {liveTargets.map(t => (
            <CircleMarker 
              key={t.id}
              center={[t.lat, t.lng]}
              radius={6}
              fillColor={t.color}
              color="#fff"
              weight={1}
              fillOpacity={1}
            >
               <Popup>
                 <div className="text-xs font-mono">
                   <strong>{t.name}</strong><br/>
                   SPEED: {(Math.random() * 100).toFixed(1)} km/h<br/>
                   HDG: {Math.floor(Math.random() * 360)}°
                 </div>
               </Popup>
            </CircleMarker>
          ))}
        
        {/* Draw Connection Lines first so they are behind markers */}
        {selectedCaseId && relatedCases.map((rc, idx) => {
          const current = getCaseById(selectedCaseId);
          const related = getCaseById(rc.case_id);
          if (current && related) {
             return (
               <Polyline 
                 key={`line-${idx}`}
                 positions={[
                   [current.location.lat, current.location.lng],
                   [related.location.lat, related.location.lng]
                 ]}
                 pathOptions={{ color: '#3b82f6', weight: 1, dashArray: '5, 10', opacity: 0.6 }}
               />
             );
          }
          return null;
        })}

        {/* All Case Markers */}
        {cases.map((c) => {
          const isSelected = selectedCaseId === c.id;
          const isRelated = relatedCases.some(rc => rc.case_id === c.id);
          const isDimmed = selectedCaseId && !isSelected && !isRelated;

          return (
            <Marker 
              key={c.id} 
              position={[c.location.lat, c.location.lng]}
              opacity={isDimmed ? 0.2 : 1}
              zIndexOffset={isSelected ? 1000 : isRelated ? 500 : 0}
            >
              <Popup>
                <div className="text-slate-900 min-w-[200px]">
                  <strong className="block text-lg border-b border-slate-300 pb-1 mb-2">{c.title}</strong>
                  <span className="text-xs font-mono bg-slate-800 text-white px-1.5 py-0.5 rounded">{c.id}</span>
                  <p className="my-2 text-sm">{c.description}</p>
                  <div className="text-xs text-slate-500 mt-2 grid grid-cols-2 gap-2">
                    <div>Status: <span className="font-bold">{c.status}</span></div>
                    <div>Severity: <span className={`font-bold ${c.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`}>{c.severity}</span></div>
                  </div>
                  {isRelated && (
                     <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-blue-600 font-bold bg-blue-50 p-1 rounded">
                       🔗 {relatedCases.find(rc => rc.case_id === c.id)?.reason}
                     </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Trajectory Polyline */}
        {selectedCaseId && trajectory.length > 0 && (
          <>
            <Polyline 
              positions={trajectory.map(p => [p.lat, p.lng])} 
              color="#f59e0b" 
              weight={3} 
              dashArray="10, 5" 
            />
            {/* Current Position Indicator */}
            <CircleMarker 
              center={[trajectory[currentIndex].lat, trajectory[currentIndex].lng]}
              radius={8}
              fillColor="#f59e0b"
              color="#fff"
              weight={2}
              fillOpacity={1}
            >
              <Popup>Current Position: {trajectory[currentIndex].activity}</Popup>
            </CircleMarker>
          </>
        )}
        </MapContainer>
      )}

      {/* 3D ORBIT VIEW */}
      {viewMode === '3D' && (
         <div className="absolute inset-0 z-0 bg-black">
             <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Earth />
                <Satellites />
                <OrbitControls enableZoom={true} minDistance={3} maxDistance={10} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20"></div>
         </div>
      )}
    </div>
  );
};

export default CaseMap;
