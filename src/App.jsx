import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, Plus, Settings, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { UploadScreen } from './components/screens/UploadScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { TCScreen } from './components/screens/TCScreen';
import { projectStore } from './services/storage/projectStore';

export default function App() {
  const [screen, setScreen] = useState('upload');
  const [currentProject, setCurrentProject] = useState(null);
  
  // App mostly handles screen switching and passes very minimal state
  const [sourceText, setSourceText] = useState('');
  const [extractedReqs, setExtractedReqs] = useState([]);
  const [triggerGenerate, setTriggerGenerate] = useState(false);
  const [sourceInfo, setSourceInfo] = useState({ name: 'Manual Input', type: 'text', id: 'doc-001', tokens: 0 });

  // Initial restoration
  useEffect(() => {
    const lastProject = projectStore.getCurrentProject();
    if (lastProject) {
      setCurrentProject(lastProject);
      if (lastProject.lastScreen) setScreen(lastProject.lastScreen);
      if (lastProject.lastSourceText) setSourceText(lastProject.lastSourceText);
      if (lastProject.lastSourceInfo) setSourceInfo(lastProject.lastSourceInfo);
    } else {
      // Create a default project if none exists
      const newProj = projectStore.createProject("My First Project");
      setCurrentProject(newProj);
    }
  }, []);

  const handleScreenChange = useCallback((newScreen) => {
    setScreen(newScreen);
    if (currentProject) {
      projectStore.updateSessionState(currentProject.projectId, newScreen);
    }
  }, [currentProject]);

  const handleTextChange = useCallback((newText) => {
    setSourceText(newText);
    if (currentProject) {
      projectStore.updateSourceText(currentProject.projectId, newText);
    }
  }, [currentProject]);

  const startAnalysis = (text, info) => {
    setSourceText(text);
    const resolvedInfo = info || { name: 'Manual Input', type: 'text', id: 'doc-001', tokens: Math.ceil(text.length / 4) };
    setSourceInfo(resolvedInfo);
    
    if (currentProject) {
      const isNewText = currentProject.lastSourceText !== text;

      projectStore.updateSourceText(currentProject.projectId, text);
      projectStore.updateSourceInfo(currentProject.projectId, resolvedInfo);

      if (isNewText) {
        projectStore.updateRequirements(currentProject.projectId, []);
        projectStore.updateAnalysisSummary(currentProject.projectId, null);
      }

      projectStore.updateSessionState(currentProject.projectId, 'analysis');
    }
    setScreen('analysis');
  };

  const startGenerateTC = (reqs) => {
    setExtractedReqs(reqs);
    setTriggerGenerate(true);
    if (currentProject) {
      projectStore.updateSessionState(currentProject.projectId, 'tc');
    }
    setScreen('tc');
  };

  const renderMain = () => {
    if (!currentProject) return null;

    switch (screen) {
      case 'upload':   return <UploadScreen onAnalyze={startAnalysis} text={sourceText} setText={handleTextChange} projectId={currentProject.projectId} />;
      case 'analysis': return <AnalysisScreen onGenerateTC={startGenerateTC} sourceText={sourceText} sourceDocumentId={sourceInfo.id} sourceName={sourceInfo.name} tokens={sourceInfo.tokens} isImage={['png', 'jpg'].includes(sourceInfo.type)} projectId={currentProject.projectId} />;
      case 'tc':       return <TCScreen requirements={extractedReqs} projectId={currentProject.projectId} triggerGenerate={triggerGenerate} onGenerateComplete={() => setTriggerGenerate(false)} />;
      default:         return <UploadScreen onAnalyze={startAnalysis} text={sourceText} setText={handleTextChange} projectId={currentProject.projectId} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar screen={screen} setScreen={handleScreenChange} />

      {/* Main */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span className="topbar-breadcrumb-item">프로젝트</span>
            <ChevronRight size={13} style={{ color: 'var(--color-text-muted)' }} />
            <span className="topbar-breadcrumb-item">{currentProject?.projectName || 'Loading...'}</span>
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
            <button className="icon-btn" onClick={() => {
              const newProj = projectStore.createProject(`Project ${Date.now()}`);
              setCurrentProject(newProj);
              setScreen('upload');
            }}><Plus size={15} /></button>
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
              style={{ height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              {renderMain()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
