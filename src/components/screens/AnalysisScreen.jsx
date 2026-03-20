import React, { useState } from 'react';
import { Search, FileText, CheckCircle, AlertTriangle, Cpu, Layers, Edit2, Filter, BookOpen, Zap, AlertCircle, LayoutList, Check, Target } from 'lucide-react';
import { Badge, ConfBadge } from '../ui/Badges';

export const AnalysisScreen = ({ onGenerateTC, analysis, sourceText }) => {
  const [selectedReqId, setSelectedReqId] = useState(analysis?.requirements?.[0]?.id || null);
  const [isOCRMode, setIsOCRMode] = useState(false);
  const selectedReq = analysis?.requirements?.find(r => r.id === selectedReqId) || 
                      analysis?.risks?.find(r => 'risk-' + r.text === selectedReqId) || 
                      null;

  const reqs = analysis?.requirements || [];
  const totalReqs = reqs.length;
  const reviewCount = reqs.filter(r => r.type === 'review').length;
  const autoCount = reqs.filter(r => r.conf === 'High').length;

  return (
    <div className="animate-in" style={{ 
      display: 'flex', flexDirection: 'column', height: '100%', 
      background: '#f8fafc', fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* Top area: Sticky summary strip */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Target size={12} /> ACTIVE ANALYSIS WORKSPACE
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Requirement Extraction & Review</h1>
          </div>
          <div style={{ width: '1px', height: '32px', background: '#e2e8f0' }}></div>
          <div style={{ display: 'flex', gap: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Total Extracted</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{totalReqs}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>items</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Review Needed</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: reviewCount > 0 ? '#d97706' : '#64748b' }}>{reviewCount}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>items</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Automation Candidates</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: autoCount > 0 ? '#059669' : '#64748b' }}>{autoCount}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>items</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1',
            borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.15s'
          }} onClick={() => setIsOCRMode(!isOCRMode)}>
            <BookOpen size={14} /> {isOCRMode ? 'Source View' : 'OCR View'}
          </button>
          <button style={{
            background: '#4f46e5', color: '#ffffff', border: '1px solid #4338ca',
            borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(79,70,229,0.1)'
          }} onClick={onGenerateTC}>
            <CheckCircle size={14} /> Ready for Test Cases
          </button>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: Source Viewer (28%) */}
        <div style={{
          flex: '0 0 28%', borderRight: '1px solid #e2e8f0', background: '#f8fafc',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <FileText size={14} color="#64748b" /> Source Reference Document
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>Version: <strong>v1.2</strong></span>
              <span>Tokens: <strong>~2.4k</strong></span>
            </div>
          </div>
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            {sourceText ? (
              <div style={{
                background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px',
                padding: '24px', fontSize: '13px', color: '#334155', lineHeight: '1.7',
                whiteSpace: 'pre-line', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {isOCRMode ? (
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                    [OCR Layer Output]{"\n\n"}{sourceText}
                  </div>
                ) : (
                  sourceText
                )}
              </div>
            ) : (
              <div style={{
                border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '48px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', color: '#64748b', background: '#ffffff'
              }}>
                <FileText size={32} color="#94a3b8" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>No Source Material Available</div>
                <div style={{ fontSize: '12px', lineHeight: '1.5' }}>Upload a PRD, manual, or unstructured document to serve as the reference for requirement extraction.</div>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Extracted Requirement Queue (34%) */}
        <div style={{
          flex: '0 0 34%', borderRight: '1px solid #e2e8f0', background: '#ffffff',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Extraction Queue ({totalReqs})
              </div>
              <button style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px 8px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600' }}>
                <Filter size={12} /> Filter
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input type="text" placeholder="Search extracted rules..." style={{
                width: '100%', padding: '8px 10px 8px 32px', borderRadius: '6px',
                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }}/>
            </div>
          </div>
          
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', background: '#f1f5f9' }}>
            {reqs.length > 0 ? reqs.map(req => {
              const isSelected = selectedReqId === req.id;
              const isReview = req.type === 'review';
              const isAuto = req.conf === 'High';

              return (
                <div key={req.id} onClick={() => setSelectedReqId(req.id)} style={{
                  padding: '14px 16px', borderRadius: '8px', cursor: 'pointer',
                  background: '#ffffff',
                  border: `1px solid ${isSelected ? '#4f46e5' : '#cbd5e1'}`,
                  boxShadow: isSelected ? '0 0 0 1px #4f46e5, 0 4px 6px rgba(0,0,0,0.05)' : '0 1px 2px rgba(0,0,0,0.02)',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  transition: 'all 0.15s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#4338ca' : '#475569' }}>{req.id || 'REQ-1'}</span>
                      {isReview && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', background: '#fef3c7', color: '#d97706', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={10} /> Review</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <ConfBadge conf={req.conf} />
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: isSelected ? '500' : '400', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.text}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>Type: {req.tag || 'Functional'}</span>
                    {isAuto && <span style={{ fontSize: '11px', fontWeight: '600', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} /> Auto-Candidate</span>}
                  </div>
                </div>
              );
            }) : (
              <div style={{
                border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '48px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', color: '#64748b', background: '#ffffff', height: '100%'
              }}>
                <LayoutList size={32} color="#94a3b8" style={{ marginBottom: '16px' }} />
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Queue is Empty</div>
                <div style={{ fontSize: '12px', lineHeight: '1.5' }}>No requirements have been extracted yet. Process a document to populate this queue.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Review Detail Workspace (38%) */}
        <div style={{
          flex: '1', background: '#f8fafc', display: 'flex', flexDirection: 'column', position: 'relative'
        }}>
          {selectedReq ? (
            <>
              {/* Section A: Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>{selectedReq.id || 'Detail'}</h2>
                  {selectedReq.type === 'review' ? (
                    <span style={{ fontSize: '11px', padding: '4px 10px', background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', borderRadius: '99px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={12} /> Needs Review
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '99px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> Ready
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Edit2 size={14} /> Quick Edit
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Section B: Requirement Text Block */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Extracted Requirement Context</span>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#94a3b8', textTransform: 'none', letterSpacing: '0' }}>Confidence: {selectedReq.conf}</span>
                  </div>
                  <div style={{
                    width: '100%', minHeight: '80px', padding: '16px', borderRadius: '8px',
                    border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '14px',
                    color: '#1e293b', lineHeight: '1.6', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                    position: 'relative'
                  }}>
                    {selectedReq.text}
                  </div>
                </div>

                {/* Section C: AI Interpretation */}
                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                   <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Cpu size={14} color="#4f46e5" /> Analysis & Interpretation
                   </div>
                   <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                     <div>
                       <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Inferred Category</div>
                       <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{selectedReq.tag || 'Functional Requirement'}</div>
                     </div>
                     <div>
                       <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Automation Vector</div>
                       <div style={{ fontSize: '14px', color: selectedReq.conf === 'High' ? '#059669' : '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                         {selectedReq.conf === 'High' ? <><Zap size={14} /> High Candidate</> : 'Manual Testing Recommended'}
                       </div>
                     </div>
                   </div>
                </div>

                {/* Section E: Review Warning Box (If needed) */}
                {selectedReq.type === 'review' && (
                  <div style={{ background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#d97706', background: '#fef3c7', padding: '8px', borderRadius: '100%' }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#b45309', marginBottom: '6px' }}>Ambiguity Detected in Source</div>
                      <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                        The expected condition for this assertion is vaguely defined. Consider specifying exact branch outcomes or numerical thresholds before generating test cases.
                      </div>
                    </div>
                  </div>
                )}

                {/* Section D: Derived Test Points */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Derived Test Parameters
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[1,2].map(i => (
                      <div key={i} style={{ background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '14px 16px', fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <div style={{ marginTop: '2px', color: '#cbd5e1' }}><Target size={14} /></div>
                        <div style={{ lineHeight: '1.5' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>Verification Point {i}:</span> Verify the constraint matches explicitly defined criteria for {selectedReq.id || 'this context'}. Ensure all edge cases evaluate properly.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Section F: Sticky Action Bar */}
              <div style={{ position: 'sticky', bottom: 0, padding: '16px 24px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                <div>
                  <button style={{ background: 'none', border: 'none', fontSize: '13px', color: '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'color 0.2s', padding: '8px 0' }} onClick={(e) => { e.currentTarget.style.color = '#ef4444'; setTimeout(() => e.target.style.color = '#64748b', 1000)}}>Exclude from Automation</button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{ background: '#ffffff', color: '#d97706', border: '1px solid #fcd34d', borderRadius: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e=>e.target.style.background='#fef3c7'} onMouseLeave={e=>e.target.style.background='#ffffff'}>Flag for Review</button>
                  <button style={{ background: '#4f46e5', color: '#ffffff', border: '1px solid #4338ca', borderRadius: '6px', padding: '8px 24px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(79,70,229,0.1)', transition: 'background 0.2s' }} onMouseEnter={e=>e.target.style.background='#4338ca'} onMouseLeave={e=>e.target.style.background='#4f46e5'}>Approve Item</button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '32px' }}>
              <div style={{ maxWidth: '320px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '100%', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                  <Target size={32} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Select an item to begin</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                  Select an extracted requirement from the queue to review its AI interpretation, verify confidence, and approve it for test generation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
