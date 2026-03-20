import React, { useState, useCallback } from 'react';
import { ChevronRight, Plus, Settings, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { UploadScreen } from './components/screens/UploadScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { TCScreen } from './components/screens/TCScreen';

export default function App() {
  const [screen, setScreen] = useState('upload');
  
  // App mostly handles screen switching and passes very minimal state
  const [sourceText, setSourceText] = useState('');
  const [extractedReqs, setExtractedReqs] = useState([]);

  const startAnalysis = (text) => {
    setSourceText(text);
    setScreen('analysis');
  };

  const startGenerateTC = (reqs) => {
    setExtractedReqs(reqs);
    setScreen('tc');
  };

  const renderMain = () => {
    switch (screen) {
      case 'upload':   return <UploadScreen onAnalyze={startAnalysis} text={sourceText} setText={setSourceText} />;
      case 'analysis': return <AnalysisScreen onGenerateTC={startGenerateTC} sourceText={sourceText} />;
      case 'tc':       return <TCScreen requirements={extractedReqs} />;
      default:         return <UploadScreen onAnalyze={startAnalysis} text={sourceText} setText={setSourceText} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar screen={screen} setScreen={setScreen} />

      {/* Main */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span className="topbar-breadcrumb-item">프로젝트</span>
            <ChevronRight size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span className="topbar-breadcrumb-item">Viewer v1.3</span>
            <ChevronRight size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span className="topbar-breadcrumb-item current">
              {{ upload: '요구사항 입력', analysis: '요구사항 분석', tc: 'TC 검토 / 승인' }[screen]}
            </span>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <input type="text" placeholder="검색..." />
            </div>
            <button className="icon-btn"><Plus size={15} /></button>
            <button className="icon-btn"><Settings size={15} /></button>
          </div>
        </header>

        {/* Page */}
        <main className="page-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{ height: '100%' }}
            >
              {renderMain()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
