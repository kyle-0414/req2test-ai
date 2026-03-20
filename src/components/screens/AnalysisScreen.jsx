import React, { useState } from 'react';
import { Search, FileText, CheckCircle, AlertTriangle, Cpu, Layers, Edit2, PlayCircle, Filter } from 'lucide-react';
import { Badge, ConfBadge } from '../ui/Badges';

export const AnalysisScreen = ({ onGenerateTC, analysis, sourceText }) => {
  const [selectedReqId, setSelectedReqId] = useState(analysis?.requirements?.[0]?.id || null);
  const selectedReq = analysis?.requirements?.find(r => r.id === selectedReqId) || 
                      analysis?.risks?.find(r => 'risk-' + r.text === selectedReqId) || 
                      analysis?.requirements?.[0]; // Fallback

  const totalReqs = analysis?.requirements?.length || 0;
  const reviewCount = analysis?.requirements?.filter(r => r.type === 'review')?.length || 0;
  const autoCount = analysis?.requirements?.filter(r => r.conf === 'High')?.length || 0;
  const testPointsCount = totalReqs * 2 + 1; // mock

  return (
    <div className="animate-in" style={{ 
      display: 'flex', flexDirection: 'column', height: '100%', 
      background: '#f8fafc', fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* Top area: Sticky summary strip */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Analysis Review</h1>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Compact summary metrics */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Extracted</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{totalReqs}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review Needed</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#d97706' }}>{reviewCount}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Automation Found</span>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#059669' }}>{autoCount}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            background: '#ffffff', color: '#475569', border: '1px solid #e2e8f0',
            borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer'
          }}>Source OCR</button>
          <button style={{
            background: '#4f46e5', color: '#ffffff', border: 'none',
            borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(79,70,229,0.2)'
          }} onClick={onGenerateTC}>
            <CheckCircle size={14} /> Ready for Test Cases
          </button>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: Source Viewer (30%) */}
        <div style={{
          flex: '0 0 30%', borderRight: '1px solid #e2e8f0', background: '#f8fafc',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Source Document
            </div>
          </div>
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            <div style={{
              background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px',
              padding: '24px', fontSize: '13px', color: '#334155', lineHeight: '1.7',
              whiteSpace: 'pre-line', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              {sourceText || 'No source text available.'}
            </div>
          </div>
        </div>

        {/* Center Panel: Extracted Requirement List (32%) */}
        <div style={{
          flex: '0 0 32%', borderRight: '1px solid #e2e8f0', background: '#ffffff',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Extraction Queue
              </div>
              <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Filter size={16} /></button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input type="text" placeholder="Search requirements..." style={{
                width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px',
                border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', background: '#f8fafc'
              }}/>
            </div>
          </div>
          <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(analysis?.requirements || []).map(req => {
              const isSelected = selectedReqId === req.id;
              return (
                <div key={req.id} onClick={() => setSelectedReqId(req.id)} style={{
                  padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                  background: isSelected ? '#eef2ff' : '#ffffff',
                  border: `1px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                  boxShadow: isSelected ? '0 0 0 1px #4f46e5' : 'none',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: isSelected ? '#4338ca' : '#64748b' }}>{req.id || 'REQ-1'}</span>
                    <ConfBadge conf={req.conf} />
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: isSelected ? '500' : '400', lineHeight: '1.4' }}>
                    {req.text}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', background: '#f1f5f9', color: '#64748b', borderRadius: '4px' }}>{req.tag}</span>
                    {req.conf === 'High' && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', background: '#d1fae5', color: '#059669', borderRadius: '4px' }}>Automated</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Review Detail Panel (38%) */}
        <div style={{
          flex: '1', background: '#f8fafc', display: 'flex', flexDirection: 'column', position: 'relative'
        }}>
          {selectedReq ? (
            <>
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>{selectedReq.id || 'Detail'}</h2>
                  <span style={{ fontSize: '11px', padding: '4px 8px', background: '#fef3c7', color: '#d97706', borderRadius: '99px', fontWeight: '600' }}>Review Needed</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: '500' }}><Edit2 size={13} style={{ marginRight: '4px' }}/> Edit</button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Editable Requirement Text Block */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Extracted Requirement</div>
                  <textarea style={{
                    width: '100%', minHeight: '80px', padding: '16px', borderRadius: '12px',
                    border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '14px',
                    color: '#1e293b', lineHeight: '1.5', resize: 'vertical', outline: 'none'
                  }} defaultValue={selectedReq.text} />
                </div>

                {/* AI Interpretation Block */}
                <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={14} color="#4f46e5" /> AI Interpretation
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Inferred Type</div>
                      <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{selectedReq.tag || 'Functional'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Automation Suitability</div>
                      <div style={{ fontSize: '13px', color: '#059669', fontWeight: '500' }}>{selectedReq.conf === 'High' ? 'High Candidate' : 'Manual Recommended'}</div>
                    </div>
                  </div>
                </div>

                {/* Warning / Ambiguity panel */}
                {selectedReq.type === 'review' && (
                  <div style={{ background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a', padding: '16px', display: 'flex', gap: '12px' }}>
                    <div style={{ color: '#d97706', marginTop: '2px' }}><AlertTriangle size={16} /></div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#b45309', marginBottom: '4px' }}>Ambiguity Detected</div>
                      <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.4' }}>The expected result condition is vague. Consider clarifying exact branch paths.</div>
                    </div>
                  </div>
                )}

                {/* Extracted Test Points */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Derived Test Points</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[1,2].map(i => (
                      <div key={i} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                        Verify the condition works as specifically described in {selectedReq.id || 'the requirement'}. ({i})
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sticky Action Bar */}
              <div style={{ position: 'sticky', bottom: 0, padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', zIndex: 10 }}>
                <button style={{ background: 'none', border: 'none', fontSize: '13px', color: '#64748b', fontWeight: '500', cursor: 'pointer' }}>Mark Manual Only</button>
                <button style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Mark Review Needed</button>
                <button style={{ background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(79,70,229,0.2)' }}>Approve Item</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>
              Select an item to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
