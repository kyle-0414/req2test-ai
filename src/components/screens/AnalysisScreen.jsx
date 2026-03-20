import React from 'react';
import { Search, FileText, RotateCcw, CheckCircle } from 'lucide-react';
import { Badge, ConfBadge } from '../ui/Badges';

export const AnalysisScreen = ({ onGenerateTC, analysis, sourceText }) => (
  <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div className="page-toolbar">
      <div>
        <h1 className="page-title">요구사항 분석 결과</h1>
        <p className="page-subtitle">원문과 AI 추출 결과를 나란히 검토하세요</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary"><RotateCcw size={13}/> 재분석</button>
        <button className="btn btn-primary" onClick={onGenerateTC}>
          <CheckCircle size={13}/> TC 초안 생성
        </button>
      </div>
    </div>

    {/* Summary stats */}
    <div className="stat-grid">
      {[
        { label: '추출 요구사항', value: String(analysis?.requirements?.length ?? 0), cls: 'primary' },
        { label: '자동화 후보', value: String(analysis?.requirements?.filter(r => r.conf === 'High').length ?? 0), cls: 'success' },
        { label: '검토 필요', value: String(analysis?.requirements?.filter(r => r.type === 'review').length ?? 0), cls: 'warning' },
        { label: '리스크 포인트', value: String(analysis?.risks?.length ?? 0), cls: 'danger' },
      ].map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-label">{s.label}</div>
          <div className={`stat-value ${s.cls}`}>{s.value}</div>
        </div>
      ))}
    </div>

    {/* Split View */}
    <div className="split-view" style={{ flex: 1, borderTop: '1px solid var(--color-border)' }}>
      <div className="split-pane">
        <div className="section-label"><FileText size={13}/> 원문 소스</div>
        <div className="source-viewer">{sourceText || '(입력된 요구사항 없음)'}</div>
      </div>

      <div className="split-pane">
        <div className="section-label"><Search size={13}/> AI 추출 결과 (GEMINI FLASH)</div>
        <div className="req-list">
          {(analysis?.requirements ?? []).map(req => (
            <div key={req.id} className={`req-item ${req.type}`}>
              <div>
                <div className="req-item-tag">{req.tag}</div>
                <div className="req-item-text">{req.text}</div>
              </div>
              <ConfBadge conf={req.conf} />
            </div>
          ))}
          {(analysis?.risks ?? []).map((risk, i) => (
            <div key={`risk-${i}`} className="req-item review" style={{ borderLeft: '3px solid var(--color-warning)', background: 'var(--color-warning-bg)' }}>
              <div>
                <div className="req-item-tag" style={{ color: 'var(--color-warning)' }}>⚠ 리스크</div>
                <div className="req-item-text">{risk.text}</div>
              </div>
              <Badge type="warning">검토 필요</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
