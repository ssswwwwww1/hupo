import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SceneViewer from './components/SceneViewer';
import CaseMap from './components/CaseMap';
import DataAnalysis from './components/DataAnalysis';
import Reports from './components/Reports';
import AIChat from './components/AIChat';
import Forensics from './components/Forensics';
import Login from './components/Login';

function App() {
  // Temporary bypass for debugging
  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // if (!isLoggedIn) {
  //   return <Login onLogin={() => setIsLoggedIn(true)} />;
  // }

  return (
    <Router>
      <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
        <div className="scanline"></div>
        <Sidebar />
        <main className="flex-1 overflow-auto relative bg-transparent z-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<CaseMap />} />
            <Route path="/data" element={<DataAnalysis />} />
            <Route path="/scene" element={<SceneViewer />} />
            <Route path="/forensics" element={<Forensics />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
        <AIChat />
      </div>
    </Router>
  );
}

export default App;
