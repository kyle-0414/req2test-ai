import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, Eye, BarChart3, Clock } from 'lucide-react';
import { Badge, PriorityBadge, RunStatusBadge } from '../ui/Badges';

export const TCScreen = ({ initialTcs }) => {
  const [tcs, setTcs] = useState(initialTcs);
  const [selectedId, setSelectedId] = useState(initialTcs?.[0]?.id || null);
  const [isRunning, setIsRunning] = useState(false);
  const [runLog, setRunLog] = useState([]);
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'run'

  const approvedCount = tcs.filter(t => t.status === 'approved').length;
  const draftCount = tcs.filter(t => t.status === 'draft').length;
  const selected = tcs.find(t => t.id === selectedId);

  const toggleApprove = (id) => {
    setTcs(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'approved' ? 'draft' : 'approved' } : t
    ));
  };

  const runAutomation = () => {
    const approved = tcs.filter(t => t.status === 'approved');
    if (!approved.length) return;
    setActiveTab('run');
    setIsRunning(true);
    setRunLog([]);
    const logs = [
      { text: '▶ 자동화 실행 시작...', type: 'info' },
      { text: '  세션 초기화 중', type: '' },
      { text: '  앱 홈 화면 진입 확인', type: '' },
      ...approved.flatMap(t => [
        { text: `  ${t.id}: 탐색 중...`, type: '' },
        { text: `  ${t.id}: 검증 진행 중...`, type: '' },
        { text: `  ${t.id}: Pass ✓`, type: 'success' },
      ])
    ];

    logs.forEach((log, i) => {
      setTimeout(() => {
        setRunLog(prev => [...prev, log]);
        if (i === logs.length - 1) {
          setIsRunning(false);
          setTcs(prev => prev.map(t =>
            t.status === 'approved' ? { ...t, runStatus: 'pass' } : t
          ));
        }
      }, i * 600);
    });
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">테스트케이스 검토</h1>
          <p className="page-subtitle">초안을 검토하고 승인 후 자동화를 실행하세요</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 12px', background: 'var(--color-bg)', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>초안 {draftCount}</span>
            <span style={{ color: 'var(--color-border)' }}>|</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>승인 {approvedCount}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={runAutomation}
            disabled={approvedCount === 0 || isRunning}
            style={{ opacity: approvedCount === 0 ? 0.5 : 1 }}
          >
            <Play size={13} /> 승인된 TC 실행 ({approvedCount})
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
          TC 검토 / 승인
        </button>
        <button className={`tab-btn ${activeTab === 'run' ? 'active' : ''}`} onClick={() => setActiveTab('run')}>
          자동화 실행 {runLog.length > 0 && <Badge type="info" style={{ marginLeft: 4 }}>완료</Badge>}
        </button>
      </div>

      {activeTab === 'review' && (
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 6fr', flex: 1, overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}>
          {/* TC List */}
          <div style={{ borderRight: '1px solid var(--color-border)', overflowY: 'auto', padding: '16px 20px' }}>
            <div className="tc-list">
              {tcs.map(tc => (
                <div
                  key={tc.id}
                  className={`tc-item${tc.status === 'approved' ? ' approved' : ''}${selectedId === tc.id ? '' : ''}`}
                  style={selectedId === tc.id ? { borderColor: 'var(--color-primary)', boxShadow: '0 0 0 2px rgba(79,70,229,0.15)' } : {}}
                  onClick={() => setSelectedId(tc.id)}
                >
                  <div>
                    <div className="tc-item-id">{tc.id}</div>
                    <div className="tc-item-title">{tc.title}</div>
                    <div className="tc-item-meta">
                      <PriorityBadge p={tc.priority} />
                      {tc.autoCandidate && <Badge type="info">자동화 후보</Badge>}
                      {tc.runStatus && <RunStatusBadge status={tc.runStatus} />}
                    </div>
                  </div>
                  <div className="tc-item-actions">
                    <button
                      onClick={e => { e.stopPropagation(); toggleApprove(tc.id); }}
                      className={`btn btn-sm ${tc.status === 'approved' ? 'btn-success' : 'btn-secondary'}`}
                    >
                      <CheckCircle size={12} />
                      {tc.status === 'approved' ? '승인됨' : '승인'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TC Detail */}
          <div style={{ overflowY: 'auto', padding: '16px 20px' }}>
            {selected && (
              <div className="animate-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div className="tc-item-id">{selected.id}</div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>{selected.title}</h2>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <PriorityBadge p={selected.priority} />
                    {selected.autoCandidate && <Badge type="info">자동화 후보</Badge>}
                  </div>
                </div>

                <div className="tc-detail-grid">
                  {[
                    { label: '사전 조건', value: selected.prereq },
                    { label: '우선순위', value: selected.priority },
                  ].map((d, i) => (
                    <div key={i}>
                      <div className="tc-detail-label">{d.label}</div>
                      <div className="tc-detail-value">{d.value}</div>
                    </div>
                  ))}
                </div>

                <hr className="divider" style={{ margin: '14px 0' }} />

                <div style={{ marginBottom: 12 }}>
                  <div className="tc-detail-label" style={{ marginBottom: 6 }}>테스트 단계</div>
                  <div className="source-viewer" style={{ fontSize: 13, whiteSpace: 'pre-line' }}>
                    {selected.steps}
                  </div>
                </div>

                <div>
                  <div className="tc-detail-label" style={{ marginBottom: 6 }}>기대 결과</div>
                  <div className="card card-sm" style={{ borderLeft: '3px solid var(--color-success)' }}>
                    <div className="card-body" style={{ color: 'var(--color-success)', fontWeight: 500, padding: '10px 14px' }}>
                      {selected.expected}
                    </div>
                  </div>
                </div>

                {selected.runStatus && (
                  <div style={{ marginTop: 14 }}>
                    <div className="tc-detail-label" style={{ marginBottom: 6 }}>실행 결과</div>
                    <div className={`card card-sm`} style={{ borderLeft: `3px solid var(--color-${selected.runStatus === 'pass' ? 'success' : 'danger'})` }}>
                      <div className="card-body" style={{ padding: '10px 14px' }}>
                        <RunStatusBadge status={selected.runStatus} />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button
                    className={`btn btn-sm ${selected.status === 'approved' ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => toggleApprove(selected.id)}
                  >
                    <CheckCircle size={12} />
                    {selected.status === 'approved' ? '승인 취소' : '승인'}
                  </button>
                  <button className="btn btn-sm btn-ghost"><XCircle size={12} /> 반려</button>
                  <button className="btn btn-sm btn-ghost"><Eye size={12} /> 수동 전용</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'run' && (
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, flex: 1, overflowY: 'auto' }}>
          {/* Run Log */}
          <div>
            <div className="run-panel">
              <div className="run-panel-title">
                {isRunning ? '⟳ AI 실행 중...' : '실행 로그'}
              </div>
              <div className="run-log">
                {runLog.length === 0 && (
                  <div className="run-log-line" style={{ opacity: 0.4 }}>
                    위 '승인된 TC 실행' 버튼으로 자동화를 시작하세요
                  </div>
                )}
                {runLog.map((l, i) => (
                  <div key={i} className={`run-log-line ${l.type}`}>{l.text}</div>
                ))}
                {isRunning && <div className="run-log-line info">▌</div>}
              </div>
            </div>
          </div>

          {/* Run Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="section-label"><BarChart3 size={13}/> TC별 실행 결과</div>
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
            {tcs.filter(t => t.status === 'approved').length === 0 && (
              <div className="empty-state">
                <Clock size={32} className="empty-state-icon" />
                <p>승인된 TC가 없습니다</p>
                <p className="text-xs text-muted">TC 검토 탭에서 TC를 승인하세요</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
