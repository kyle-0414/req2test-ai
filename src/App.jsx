import React, { useState, useCallback } from 'react';
import { ChevronRight, Plus, Settings, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeRequirement, generateTestCases, isConfigured } from './lib/aiClient';
import { MOCK_TCS } from './constants/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { UploadScreen } from './components/screens/UploadScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { TCScreen } from './components/screens/TCScreen';

export default function App() {
  const [screen, setScreen] = useState('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState('');
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [tcs, setTcs] = useState(null);
  const [aiError, setAiError] = useState(null);

  const startAnalysis = useCallback(async (text) => {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      if (!isConfigured()) {
        throw new Error('API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
      }
      setAnalyzeStep('Gemini Flash (Latest)가 요구사항을 분석 중입니다...');
      const result = await analyzeRequirement(text);
      setAnalysis(result);
      setScreen('analysis');
    } catch (e) {
      setAiError('분석 오류: ' + e.message);
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStep('');
    }
  }, []);

  const startGenerateTC = useCallback(async () => {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      if (!isConfigured()) {
        throw new Error('API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.');
      }
      if (!analysis) {
        throw new Error('분석 결과가 없습니다. 먼저 요구사항을 분석해주세요.');
      }
      setAnalyzeStep('Gemini Flash (Latest)가 TC 초안을 생성 중입니다...');
      const result = await generateTestCases(analysis.requirements, analysis.summary);
      setTcs(result);
      setScreen('tc');
    } catch (e) {
      setAiError('TC 생성 오류: ' + e.message);
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStep('');
    }
  }, [analysis]);

  const renderMain = () => {
    if (isAnalyzing) {
      return (
        <div className="loading-overlay animate-in">
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>{analyzeStep || 'AI가 처리 중입니다...'}</div>
            <div className="text-xs text-muted" style={{ marginTop: 8 }}>잠시만 기다려주세요</div>
          </div>
        </div>
      );
    }
    if (aiError) {
      return (
        <div className="loading-overlay animate-in">
          <div style={{ color: 'var(--color-danger)', fontWeight: 600, marginBottom: 12 }}>{aiError}</div>
          <button className="btn btn-secondary" onClick={() => { setAiError(null); setScreen('upload'); }}>돌아가기</button>
        </div>
      );
    }
    switch (screen) {
      case 'upload':   return <UploadScreen onAnalyze={startAnalysis} text={inputText} setText={setInputText} />;
      case 'analysis': return <AnalysisScreen onGenerateTC={startGenerateTC} analysis={analysis} sourceText={inputText} />;
      case 'tc':       return <TCScreen initialTcs={tcs || MOCK_TCS} />;
      default:         return <UploadScreen onAnalyze={startAnalysis} text={inputText} setText={setInputText} />;
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
              key={screen + (isAnalyzing ? '-loading' : '')}
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
