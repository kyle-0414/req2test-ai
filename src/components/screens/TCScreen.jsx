import React, { useState, useEffect } from 'react';
import { useTestCaseReview } from '../../hooks/useTestCaseReview';
import { Play, CheckCircle, XCircle, Eye, BarChart3, Clock, Search, Filter, ShieldCheck, FileText, Cpu, Check, ListChecks, AlertTriangle } from 'lucide-react';
import { Badge, PriorityBadge, RunStatusBadge } from '../ui/Badges';
import { judgeTestResult } from '../../lib/aiClient';

// Helper: convert internal TC ID → user-facing display ID (TC-001 format)
const getDisplayId = (tcId, tcList) => {
  const idx = tcList.findIndex(t => t.id === tcId);
  return idx >= 0 ? `TC-${String(idx + 1).padStart(3, '0')}` : tcId;
};

export const TCScreen = ({ requirements = [], projectId, triggerGenerate, onGenerateComplete }) => {
  const { testCases, isGenerating, generationError, createDrafts, approveTestCase, rejectTestCase, setManualOnly } = useTestCaseReview(projectId);

  useEffect(() => {
    // Only generate if explicitly triggered (via the "Finalize to Test Cases" button)
    if (triggerGenerate && requirements.length > 0 && !isGenerating) {
      createDrafts(projectId, requirements);
      if (onGenerateComplete) {
        onGenerateComplete();
      }
    }
  }, [requirements, projectId, triggerGenerate, createDrafts, isGenerating, onGenerateComplete]);

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (testCases.length > 0 && !selectedId) {
      setSelectedId(testCases[0].id);
    }
  }, [testCases, selectedId]);

  const [runResults, setRunResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [runLog, setRunLog] = useState([]);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'run'
  const [statusFilter, setStatusFilter] = useState('All');

  const approvedCount = testCases.filter(t => t.status === 'approved').length;
  const draftCount = testCases.filter(t => t.status === 'draft').length;
  // Make sure selected is from current tcs
  const selected = testCases.find(t => t.id === selectedId) || testCases[0];

  const runAutomation = async () => {
    const approved = testCases.filter(t => t.status === 'approved');
    if (!approved.length) return;
    setActiveTab('run');
    setIsRunning(true);
    
    let currentLogs = [
      { text: '▶ 자동화 실행 시작...', type: 'info' },
      { text: '  세션 초기화 중', type: '' },
      { text: '  앱 홈 화면 진입 확인', type: '' },
    ];
    setRunLog([...currentLogs]);

    for (const tc of approved) {
      currentLogs.push({ text: `  ${tc.id}: 탐색 중...`, type: '' });
      setRunLog([...currentLogs]);
      await new Promise(r => setTimeout(r, 600));

      currentLogs.push({ text: `  ${tc.id}: 검증 진행 중...`, type: '' });
      setRunLog([...currentLogs]);
      await new Promise(r => setTimeout(r, 600));

      try {
        currentLogs.push({ text: `  ${tc.id}: AI 시각 판독 요청 (Claude)...`, type: 'info' });
        setRunLog([...currentLogs]);

        const mockPlaywrightLog = "[System] Navigated to screen. Element with ID 'info-icon' found and clicked. View changed to 'SW Version Screen' successfully. Verification texts visible.";
        const judgeResult = await judgeTestResult(tc, mockPlaywrightLog);
        const isPass = judgeResult?.status === 'pass';
        
        currentLogs.push({ 
          text: `  ${tc.id}: ${isPass ? 'Pass ✓' : 'Fail ✗'} - ${judgeResult?.reason || ''}`, 
          type: isPass ? 'success' : 'danger' 
        });
        setRunLog([...currentLogs]);

        setRunResults(prev => ({ ...prev, [tc.id]: judgeResult?.status || 'fail' }));
      } catch (err) {
        currentLogs.push({ text: `  ${tc.id}: AI 판독 에러 (${err.message})`, type: 'danger' });
        setRunLog([...currentLogs]);
        setRunResults(prev => ({ ...prev, [tc.id]: 'fail' }));
      }
    }
    
    currentLogs.push({ text: '▶ 자동화 실행 및 AI 판독 완료', type: 'info' });
    setRunLog([...currentLogs]);
    setIsRunning(false);
  };

  if (isGenerating) {
    return (
      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>AI 검증 시나리오 작성 중...</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
              요구사항을 분석하여 QA 테스트 케이스를 생성하고 있습니다.<br/>잠시만 기다려 주세요.
            </p>
          </div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const filteredTcs = testCases.filter(tc => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Draft') return tc.status === 'draft';
    if (statusFilter === 'Approved') return tc.status === 'approved';
    if (statusFilter === 'Rejected') return tc.status === 'rejected';
    if (statusFilter === 'Manual Only') return tc.automationCandidate === false;
    return true;
  });

  return (
    <div className="animate-in" data-is-generating={isGenerating} style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Toolbar */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Test Case Review</h1>
            <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>Draft {draftCount}</span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}>Approved {approvedCount}</span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #e0e7ff' }}>Auto Candidates {testCases.filter(t=>t.automationCandidate).length}</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Review AI-generated draft test cases, edit preconditions, and finalize workflow decisions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {activeTab === 'run' ? (
             <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }} onClick={() => setActiveTab('review')}>
               Back to Review
             </button>
          ) : (
            <>
              <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', transition: 'all 0.15s ease' }}>
                Bulk Actions
              </button>
              <button
                className="btn btn-primary"
                onClick={runAutomation}
                disabled={approvedCount === 0 || isRunning}
                style={{
                  background: 'linear-gradient(180deg, #4f46e5 0%, #4338ca 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: approvedCount === 0 ? 'not-allowed' : 'pointer', opacity: approvedCount === 0 ? 0.6 : 1, boxShadow: '0 1px 3px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.1)', transition: 'all 0.15s ease'
                }}
              >
                <Play size={14} fill="currentColor" /> Proceed to Execution
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'review' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Panel: TC Queue (36%) */}
          <div style={{
            flex: '0 0 34%', borderRight: '1px solid #e2e8f0', background: '#fcfcfd',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }} className="hide-scrollbar">
                {['All', 'Draft', 'Approved', 'Rejected', 'Manual Only'].map(tab => (
                  <button key={tab} onClick={() => setStatusFilter(tab)} style={{
                    background: statusFilter === tab ? '#e2e8f0' : 'transparent',
                    color: statusFilter === tab ? '#0f172a' : '#64748b',
                    border: 'none', padding: '6px 10px', borderRadius: '6px',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}>
                    {tab}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '9px', color: '#94a3b8' }} />
                <input type="text" placeholder="Search test cases..." style={{
                  width: '100%', padding: '8px 12px 8px 34px', borderRadius: '6px',
                  border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', background: '#ffffff',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', color: '#0f172a', transition: 'border-color 0.15s ease'
                }}/>
              </div>
            </div>
            
            <div id="tc-queue-container" style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTcs.map(tc => {
                const isSelected = selectedId === tc.id;
                const isApproved = tc.status === 'approved';
                const isRejected = tc.status === 'rejected';
                return (
                  <div key={tc.id} className="tc-queue-item" onClick={() => setSelectedId(tc.id)} style={{
                    padding: '14px', borderRadius: '8px', cursor: 'pointer',
                    background: isSelected ? '#ffffff' : (isApproved ? '#fafafa' : '#ffffff'),
                    border: `1px solid ${isSelected ? '#6366f1' : 'transparent'}`,
                    borderBottom: isSelected ? `1px solid #6366f1` : '1px solid #e2e8f0',
                    boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.12), 0 0 0 1px #6366f1' : '0 1px 2px rgba(0,0,0,0.01)',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    opacity: isRejected ? 0.5 : 1, transition: 'all 0.15s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#4f46e5' : '#475569', fontFamily: 'monospace' }}>{getDisplayId(tc.id, testCases)}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                         {tc.automationCandidate && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', background: '#eef2ff', color: '#4f46e5', borderRadius: '4px', border: '1px solid #e0e7ff' }}>Auto Candidate</span>}
                         <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', background: isApproved ? '#ecfdf5' : '#f1f5f9', color: isApproved ? '#059669' : '#64748b', borderRadius: '4px', border: `1px solid ${isApproved ? '#d1fae5' : '#e2e8f0'}`, textTransform: 'capitalize' }}>
                           {tc.status}
                         </span>
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '13px', color: '#0f172a', fontWeight: '600', lineHeight: '1.4',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {tc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                      {tc.objective || tc.expectedResults?.[0]?.description}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}><FileText size={12}/> REQ-Linked</span>
                      <span style={{ fontSize: '11px', color: tc.priority === 'high' ? '#ef4444' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500', textTransform: 'capitalize' }}>P: {tc.priority || 'Medium'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: TC Workbench (64%) */}
          <div style={{
            flex: '1', background: '#f8fafc', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
          }}>
            {selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Overview Section */}
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1, paddingRight: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', fontFamily: 'monospace' }}>{getDisplayId(selected.id, testCases)}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>•</span>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>Priority: <strong style={{ color: selected.priority === 'high' ? '#ef4444' : '#64748b', textTransform: 'capitalize' }}>{selected.priority || 'Medium'}</strong></span>
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0', lineHeight: '1.3' }}>{selected.title}</h2>
                        <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.6' }}>{selected.objective || 'Objective missing.'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', background: selected.status === 'approved' ? '#ecfdf5' : selected.status === 'rejected' ? '#fef2f2' : '#f1f5f9', color: selected.status === 'approved' ? '#059669' : selected.status === 'rejected' ? '#dc2626' : '#64748b', borderRadius: '6px', border: `1px solid ${selected.status === 'approved' ? '#d1fae5' : selected.status === 'rejected' ? '#fee2e2' : '#e2e8f0'}`, textTransform: 'capitalize' }}>
                           {selected.status}
                         </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Linked Requirements</span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#334155', fontWeight: '600', background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={12}/> REQ-01</span>
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Automation</span>
                        <div style={{ fontSize: '13px', color: selected.automationCandidate ? '#059669' : '#d97706', fontWeight: '600', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {selected.automationCandidate ? <Cpu size={14} color="#059669" /> : <AlertTriangle size={14} color="#d97706" />}
                          {selected.automationCandidate ? 'Highly Suitable' : 'Manual Recommended'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preconditions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} color="#64748b" /> Preconditions
                    </div>
                    <textarea style={{
                      width: '100%', minHeight: '64px', padding: '12px 16px', borderRadius: '8px',
                      border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '13.5px',
                      color: '#0f172a', resize: 'vertical', outline: 'none', lineHeight: '1.5',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)', transition: 'border-color 0.15s ease'
                    }} defaultValue={selected.preconditions?.[0] || 'No specific preconditions provided.'} />
                  </div>

                  {/* Test Steps */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ListChecks size={16} color="#64748b" /> Test Steps
                    </div>
                    <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '0', boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
                       {Array.isArray(selected.steps) ? selected.steps.map((step, idx) => (
                         <div key={idx} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: idx !== selected.steps.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                           <div style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', width: '24px', textAlign: 'right' }}>{idx+1}.</div>
                           <input type="text" defaultValue={step.action} style={{
                             flex: 1, border: 'none', background: 'transparent', fontSize: '13.5px', color: '#0f172a', outline: 'none', lineHeight: '1.5'
                           }} />
                         </div>
                       )) : null}
                    </div>
                  </div>

                  {/* Expected Results */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} color="#059669" /> Expected Result
                    </div>
                    <div style={{ background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.01)' }}>
                        <textarea id="tc-expected-result-textarea" style={{
                          width: '100%', minHeight: '60px', padding: '0', border: 'none',
                          background: 'transparent', fontSize: '13.5px', fontWeight: '500',
                          color: '#065f46', resize: 'vertical', outline: 'none', lineHeight: '1.6'
                        }} defaultValue={selected.expectedResults?.[0]?.description || 'Result not defined.'} />
                    </div>
                  </div>

                  {/* Automation Suitability Panel */}
                  <div style={{ background: '#0f172a', borderRadius: '12px', padding: '24px', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                      <Cpu size={16} color="#818cf8" /> Automation Suitability Analysis
                    </div>
                    {selected.automationCandidate ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: '0' }}>This test case is marked as a strong candidate for automation because:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '10px 12px', marginTop: '4px' }}>
                          <Check size={16} color="#34d399" style={{ marginTop: '2px' }}/>
                          <div style={{ fontSize: '13.5px', color: '#f8fafc', fontWeight: '500' }}>Clear deterministic UI result</div>
                          
                          <Check size={16} color="#34d399" style={{ marginTop: '2px' }}/>
                          <div style={{ fontSize: '13.5px', color: '#f8fafc', fontWeight: '500' }}>Repeatable validation value</div>
                          
                          <Check size={16} color="#34d399" style={{ marginTop: '2px' }}/>
                          <div style={{ fontSize: '13.5px', color: '#f8fafc', fontWeight: '500' }}>Low need for human interpretation</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ fontSize: '13.5px', color: '#cbd5e1', margin: '0' }}>This test case is recommended for <strong style={{color: '#fef08a'}}>Manual-only</strong> execution because:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '10px 12px', marginTop: '4px' }}>
                          <AlertTriangle size={16} color="#facc15" style={{ marginTop: '2px' }}/>
                          <div style={{ fontSize: '13.5px', color: '#f8fafc', fontWeight: '500' }}>High visual interpretation required</div>
                          
                          <AlertTriangle size={16} color="#facc15" style={{ marginTop: '2px' }}/>
                          <div style={{ fontSize: '13.5px', color: '#f8fafc', fontWeight: '500' }}>Ambiguous failure condition boundary</div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Decision Action Bar (Sticky Bottom) */}
                <div style={{ position: 'sticky', bottom: 0, padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', zIndex: 10, boxShadow: '0 -1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ flex: 1, display: 'flex', gap: '16px' }}>
                     {!selected.automationCandidate && <button onClick={() => setManualOnly(selected.id)} style={{ background: 'none', border: 'none', fontSize: '13px', color: '#64748b', fontWeight: '600', cursor: 'pointer', padding: '8px 0', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Set Manual Only</button>}
                  </div>
                  <button onClick={() => rejectTestCase(selected.id)} style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease' }}>Reject</button>
                  <button style={{ background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease' }}>Save Draft</button>
                  <button onClick={() => approveTestCase(selected.id)} style={{ background: selected.status === 'approved' ? '#f1f5f9' : '#0f172a', color: selected.status === 'approved' ? '#0f172a' : '#ffffff', border: selected.status === 'approved' ? '1px solid #e2e8f0' : 'none', borderRadius: '6px', padding: '8px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: selected.status === 'approved' ? 'none' : '0 1px 2px rgba(0,0,0,0.1)', transition: 'all 0.15s ease' }}>
                    {selected.status === 'approved' ? 'Approved' : 'Approve Validation'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
                Select a test case to start reviewing.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basic 'Run Tab' preserved for logic */}
      {activeTab === 'run' && (
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, overflowY: 'auto' }}>
           <div>
             <div className="run-panel">
               <div className="run-panel-title">
                 {isRunning ? '⟳ AI Execution Running...' : 'Execution Log'}
               </div>
               <div className="run-log">
                 {runLog.length === 0 && (
                   <div className="run-log-line" style={{ opacity: 0.4 }}>
                     Automatic execution log will appear here
                   </div>
                 )}
                 {runLog.map((l, i) => (
                   <div key={i} className={`run-log-line ${l.type}`}>{l.text}</div>
                 ))}
                 {isRunning && <div className="run-log-line info">▌</div>}
               </div>
             </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <div className="section-label"><BarChart3 size={13}/> Execution Results</div>
             {testCases.filter(t => t.status === 'approved').map(tc => (
               <div key={tc.id} className="card card-sm">
                 <div className="card-body">
                   <div className="run-result-row">
                     <div>
                       <div className="tc-item-id">{tc.id}</div>
                       <div style={{ fontWeight: 600, fontSize: 13.5 }}>{tc.title}</div>
                     </div>
                     <RunStatusBadge status={runResults[tc.id]} />
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

    </div>
  );
};
