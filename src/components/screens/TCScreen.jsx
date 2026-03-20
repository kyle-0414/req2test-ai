import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Eye, BarChart3, Clock, Search, Filter, ShieldCheck, FileText, Cpu, Check, ListChecks } from 'lucide-react';
import { Badge, PriorityBadge, RunStatusBadge } from '../ui/Badges';
import { judgeTestResult } from '../../lib/aiClient';

export const TCScreen = ({ initialTcs }) => {
  const [tcs, setTcs] = useState(initialTcs || []);
  const [selectedId, setSelectedId] = useState(initialTcs?.[0]?.id || null);
  const [isRunning, setIsRunning] = useState(false);
  const [runLog, setRunLog] = useState([]);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'run'
  const [statusFilter, setStatusFilter] = useState('All');

  const approvedCount = tcs.filter(t => t.status === 'approved').length;
  const draftCount = tcs.filter(t => t.status === 'draft').length;
  // Make sure selected is from current tcs
  const selected = tcs.find(t => t.id === selectedId) || tcs[0];

  const toggleApprove = (id) => {
    setTcs(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'approved' ? 'draft' : 'approved' } : t
    ));
  };

  const runAutomation = async () => {
    const approved = tcs.filter(t => t.status === 'approved');
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

        setTcs(prev => prev.map(t => 
          t.id === tc.id ? { ...t, runStatus: judgeResult?.status || 'fail' } : t
        ));
      } catch (err) {
        currentLogs.push({ text: `  ${tc.id}: AI 판독 에러 (${err.message})`, type: 'danger' });
        setRunLog([...currentLogs]);
        setTcs(prev => prev.map(t => 
          t.id === tc.id ? { ...t, runStatus: 'fail' } : t
        ));
      }
    }
    
    currentLogs.push({ text: '▶ 자동화 실행 및 AI 판독 완료', type: 'info' });
    setRunLog([...currentLogs]);
    setIsRunning(false);
  };

  const filteredTcs = tcs.filter(t => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Draft') return t.status === 'draft';
    if (statusFilter === 'Approved') return t.status === 'approved';
    if (statusFilter === 'Rejected') return t.status === 'rejected';
    if (statusFilter === 'Manual Only') return t.autoCandidate === false;
    return true;
  });

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Toolbar */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Test Case Review</h1>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '99px', background: '#f1f5f9', color: '#64748b' }}>Draft {draftCount}</span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '99px', background: '#d1fae5', color: '#059669' }}>Approved {approvedCount}</span>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '99px', background: '#e0e7ff', color: '#4f46e5' }}>Auto Candidates {tcs.filter(t=>t.autoCandidate).length}</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Review AI-generated draft test cases, edit preconditions, and decide on automation suitability.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {activeTab === 'run' ? (
             <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={() => setActiveTab('review')}>
               Back to Review
             </button>
          ) : (
            <>
              <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Bulk Actions
              </button>
              <button
                className="btn btn-primary"
                onClick={runAutomation}
                disabled={approvedCount === 0 || isRunning}
                style={{
                  background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: approvedCount === 0 ? 'not-allowed' : 'pointer', opacity: approvedCount === 0 ? 0.5 : 1, boxShadow: '0 2px 4px rgba(79,70,229,0.2)'
                }}
              >
                <Play size={14} /> Proceed to Execution Planning
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'review' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Panel: TC Queue (36%) */}
          <div style={{
            flex: '0 0 36%', borderRight: '1px solid #e2e8f0', background: '#ffffff',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['All', 'Draft', 'Approved', 'Rejected', 'Manual Only'].map(tab => (
                  <button key={tab} onClick={() => setStatusFilter(tab)} style={{
                    background: statusFilter === tab ? '#e2e8f0' : 'none',
                    color: statusFilter === tab ? '#0f172a' : '#64748b',
                    border: 'none', padding: '6px 12px', borderRadius: '6px',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                    {tab}
                  </button>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                <input type="text" placeholder="Search test cases..." style={{
                  width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px',
                  border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', background: '#f8fafc'
                }}/>
              </div>
            </div>
            
            <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTcs.map(tc => {
                const isSelected = selectedId === tc.id;
                const isApproved = tc.status === 'approved';
                const isRejected = tc.status === 'rejected';
                return (
                  <div key={tc.id} onClick={() => setSelectedId(tc.id)} style={{
                    padding: '14px 16px', borderRadius: '8px', cursor: 'pointer',
                    background: isSelected ? '#eef2ff' : (isApproved ? '#f8fafc' : '#ffffff'),
                    border: `1px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                    boxShadow: isSelected ? '0 0 0 1px #4f46e5' : '0 1px 2px rgba(0,0,0,0.02)',
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    opacity: isRejected ? 0.6 : 1
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: isSelected ? '#4338ca' : '#64748b' }}>{tc.id}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                         {tc.autoCandidate && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px' }}>Auto Candidate</span>}
                         <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', background: isApproved ? '#d1fae5' : '#f1f5f9', color: isApproved ? '#059669' : '#64748b', borderRadius: '4px' }}>
                           {tc.status === 'approved' ? 'Approved' : 'Draft'}
                         </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: '600', lineHeight: '1.4' }}>
                      {tc.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tc.objective || tc.expected}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={12}/> Req Link</span>
                      <span style={{ fontSize: '11px', color: tc.priority === 'High' ? '#dc2626' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>P: {tc.priority || 'Med'}</span>
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
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>{selected.id}</div>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{selected.title}</h2>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <span style={{ fontSize: '12px', fontWeight: '600', padding: '4px 10px', background: selected.status === 'approved' ? '#d1fae5' : '#f1f5f9', color: selected.status === 'approved' ? '#059669' : '#64748b', borderRadius: '6px' }}>
                           {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                         </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>{selected.objective || 'Objective missing.'}</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Linked Reqs</span>
                        <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500', marginTop: '2px' }}>REQ-01</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Automation</span>
                        <div style={{ fontSize: '13px', color: selected.autoCandidate ? '#059669' : '#d97706', fontWeight: '500', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Cpu size={14} /> {selected.autoCandidate ? 'Highly Suitable' : 'Manual Recommended'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preconditions */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} /> Preconditions
                    </div>
                    <textarea style={{
                      width: '100%', minHeight: '60px', padding: '12px 16px', borderRadius: '8px',
                      border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '13px',
                      color: '#334155', resize: 'vertical', outline: 'none'
                    }} defaultValue={selected.prereq || 'No specific preconditions provided.'} />
                  </div>

                  {/* Test Steps */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ListChecks size={16} /> Test Steps
                    </div>
                    <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                       {selected.steps?.split('\n').filter(s=>s.trim()).map((step, idx) => (
                         <div key={idx} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                           <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', width: '20px', paddingTop: '2px' }}>{idx+1}.</div>
                           <input type="text" defaultValue={step.replace(/^\d+\.\s*/, '')} style={{
                             flex: 1, border: 'none', background: 'transparent', fontSize: '13px', color: '#1e293b', outline: 'none'
                           }} />
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Expected Results */}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} color="#059669" /> Expected Result
                    </div>
                    <div style={{ background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', padding: '16px' }}>
                       <textarea style={{
                        width: '100%', minHeight: '60px', padding: '0', border: 'none',
                        background: 'transparent', fontSize: '13px', fontWeight: '500',
                        color: '#065f46', resize: 'vertical', outline: 'none', lineHeight: '1.6'
                      }} defaultValue={selected.expected || 'Result not defined.'} />
                    </div>
                  </div>

                  {/* Automation Suitability Panel */}
                  <div style={{ background: '#1e293b', borderRadius: '16px', padding: '20px', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Cpu size={16} color="#e0e7ff" /> Automation Suitability Analysis
                    </div>
                    {selected.autoCandidate ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 8px 0' }}>This test case is marked as a strong candidate for automation because:</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4ade80' }}><Check size={14} /> Clear deterministic UI result</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4ade80' }}><Check size={14} /> Repeatable validation value</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4ade80' }}><Check size={14} /> Low need for human interpretation</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 8px 0' }}>This test case is recommended for Manual-only execution because:</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fef08a' }}><AlertTriangle size={14} /> High visual interpretation required</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fef08a' }}><AlertTriangle size={14} /> Ambiguous failure condition boundary</div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Decision Action Bar (Sticky Bottom) */}
                <div style={{ position: 'sticky', bottom: 0, padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', zIndex: 10, boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <button style={{ background: 'none', border: 'none', fontSize: '13px', color: '#64748b', fontWeight: '600', cursor: 'pointer', padding: '8px 16px' }}>Set Manual Only</button>
                  <button style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
                  <button style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Save Draft</button>
                  <button onClick={() => toggleApprove(selected.id)} style={{ background: selected.status === 'approved' ? '#059669' : '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    {selected.status === 'approved' ? 'Approved ✓' : 'Approve Validation'}
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
             {tcs.filter(t => t.status === 'approved').map(tc => (
               <div key={tc.id} className="card card-sm">
                 <div className="card-body">
                   <div className="run-result-row">
                     <div>
                       <div className="tc-item-id">{tc.id}</div>
                       <div style={{ fontWeight: 600, fontSize: 13.5 }}>{tc.title}</div>
                     </div>
                     <RunStatusBadge status={tc.runStatus} />
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
