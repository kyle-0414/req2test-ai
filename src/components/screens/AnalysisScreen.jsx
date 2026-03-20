import React, { useState, useEffect } from 'react';
import { useAnalysisFlow } from '../../hooks/useAnalysisFlow';
import { Search, FileText, CheckCircle, AlertTriangle, Cpu, Layers, Edit2, Filter, BookOpen, Zap, AlertCircle, LayoutList, Check, Target, SlidersHorizontal, Eye, AlignLeft } from 'lucide-react';
import { Badge, ConfBadge } from '../ui/Badges';

export const AnalysisScreen = ({ onGenerateTC, sourceText, sourceDocumentId = "doc-001", projectId, sourceName = "PRD_v1.2.pdf", tokens = 2400, isImage = false }) => {
  const { requirements: reqs, summary, runAnalysis, state, updateRequirement } = useAnalysisFlow(projectId);

  useEffect(() => {
    if (sourceText && reqs.length === 0 && state === 'idle') {
      runAnalysis(projectId, sourceDocumentId, sourceText);
    }
  }, [sourceText, sourceDocumentId, projectId, reqs.length, state, runAnalysis]);

  const [selectedReqId, setSelectedReqId] = useState(null);
  const [isOCRMode, setIsOCRMode] = useState(isImage);

  useEffect(() => {
    if (reqs.length > 0 && !selectedReqId) {
      setSelectedReqId(reqs[0].id);
    }
  }, [reqs, selectedReqId]);

  const selectedReq = reqs.find(r => r.id === selectedReqId) || null;

  const totalReqs = summary?.totalExtracted || 0;
  const reviewCount = summary?.pendingReview || 0;
  const autoCount = summary?.autoCandidates || 0;

  return (
    <div className="animate-in" style={{ 
      display: 'flex', flexDirection: 'column', height: '100%', 
      background: '#f8fafc', fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* Top area: Sticky summary strip */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#ffffff', borderBottom: '1px solid #e2e8f0',
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={12} strokeWidth={2.5} /> Analysis Workspace
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>Requirement Extraction</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extracted</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>{totalReqs}</span>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#94a3b8' }}>items</span>
              </div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0', height: '28px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: reviewCount > 0 ? '#d97706' : '#94a3b8' }}>{reviewCount}</span>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#94a3b8' }}>items</span>
              </div>
            </div>
            <div style={{ width: '1px', background: '#e2e8f0', height: '28px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-Candidates</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: autoCount > 0 ? '#059669' : '#94a3b8' }}>{autoCount}</span>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#94a3b8' }}>items</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1',
            borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'background 0.2s'
          }} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='#ffffff'}>
            <SlidersHorizontal size={14} /> Settings
          </button>
          <button style={{
            background: '#4f46e5', color: '#ffffff', border: '1px solid #4338ca',
            borderRadius: '6px', padding: '8px 18px', fontSize: '13px', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(79,70,229,0.15)', transition: 'background 0.2s'
          }} onClick={() => onGenerateTC(reqs)} onMouseEnter={e=>e.currentTarget.style.background='#4338ca'} onMouseLeave={e=>e.currentTarget.style.background='#4f46e5'}>
            <CheckCircle size={14} /> Finalize to Test Cases
          </button>
        </div>
      </div>

      {/* Main Layout: 3 Columns */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel: Source Viewer (26%) */}
        <div style={{
          flex: '0 0 26%', borderRight: '1px solid #e2e8f0', background: '#f8fafc',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Panel Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={15} color="#64748b" /> Source Reference
              </div>
              <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
                <button 
                  style={{ background: !isOCRMode ? '#ffffff' : 'transparent', color: !isOCRMode ? '#1e293b' : '#64748b', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', boxShadow: !isOCRMode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s' }}
                  onClick={() => setIsOCRMode(false)}
                >Raw</button>
                <button 
                  style={{ background: isOCRMode ? '#ffffff' : 'transparent', color: isOCRMode ? '#1e293b' : '#64748b', border: 'none', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', boxShadow: isOCRMode ? '0 1px 2px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s' }}
                  onClick={() => setIsOCRMode(true)}
                >OCR</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileText size={10} color="#94a3b8" /> {sourceName}
              </span>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlignLeft size={10} color="#94a3b8" /> ~{(tokens / 1000).toFixed(1)}k tokens
              </span>
            </div>
          </div>
          
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.02)' }}>
            {sourceText ? (
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px',
                padding: '24px', fontSize: '13px', color: '#334155', lineHeight: '1.65',
                whiteSpace: 'pre-line', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {isOCRMode ? (
                  <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px', marginBottom: '16px', letterSpacing: '0.05em' }}>[ OCR TEXT EXTRACTION LAYER ]</div>
                    {sourceText}
                  </div>
                ) : (
                  sourceText
                )}
              </div>
            ) : (
              <div style={{
                border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '48px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', color: '#64748b', background: '#ffffff', height: '100%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
              }}>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '100%', marginBottom: '16px' }}>
                  <FileText size={24} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>No Reference Document</div>
                <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#64748b', maxWidth: '80%' }}>Upload a PRD or manual to establish the source of truth for extraction.</div>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel: Extracted Requirement Queue (32%) */}
        <div style={{
          flex: '0 0 32%', borderRight: '1px solid #e2e8f0', background: '#ffffff',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Panel Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={15} color="#4f46e5" strokeWidth={2.5} /> Extraction Queue
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', marginLeft: '2px' }}>{totalReqs}</span>
              </div>
              <button style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='#ffffff'}>
                <Filter size={13} /> Filter
              </button>
            </div>
            
            <div style={{ position: 'relative' }}>
              <Search size={14} strokeWidth={2.5} style={{ position: 'absolute', left: '12px', top: '9px', color: '#94a3b8' }} />
              <input type="text" placeholder="Search by ID, keyword, or tag..." style={{
                width: '100%', padding: '8px 12px 8px 34px', borderRadius: '6px',
                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#ffffff',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', transition: 'border-color 0.2s',
                color: '#1e293b'
              }}/>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', background: '#f1f5f9', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.03)' }}>
            {reqs.length > 0 ? reqs.map(req => {
              const isSelected = selectedReqId === req.id;
              const isReview = req.status === 'review_needed';
              const isAuto = req.automationCandidate;

              return (
                <div key={req.id} onClick={() => setSelectedReqId(req.id)} style={{
                  padding: '14px 16px', borderRadius: '8px', cursor: 'pointer',
                  background: '#ffffff',
                  border: `1px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                  boxShadow: isSelected ? '0 0 0 1px #4f46e5, 0 4px 6px -1px rgba(0,0,0,0.05)' : '0 1px 2px rgba(0,0,0,0.03)',
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.15s ease'
                }}>
                  {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#4f46e5' }}></div>}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: isSelected ? '6px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#4338ca' : '#334155' }}>{req.id || 'REQ-01'}</span>
                      {isReview && <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', background: '#fef3c7', color: '#b45309', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}><AlertTriangle size={10} strokeWidth={2.5} /> Review</span>}
                    </div>
                    <div>
                      <ConfBadge conf={req.confidence?.charAt(0).toUpperCase() + req.confidence?.slice(1)} />
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: isSelected ? '500' : '400', lineHeight: '1.5', paddingLeft: isSelected ? '6px' : '0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {req.normalizedText || req.originalText}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', paddingLeft: isSelected ? '6px' : '0' }}>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', textTransform: 'capitalize' }}>{req.type?.replace('_', ' ') || 'Functional'}</span>
                    {isAuto && <span style={{ fontSize: '11px', fontWeight: '600', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} strokeWidth={2.5} fill="#059669" fillOpacity={0.2} /> Auto-Candidate</span>}
                  </div>
                </div>
              );
            }) : (
              <div style={{
                border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '48px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', color: '#64748b', background: '#ffffff', height: '100%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
              }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '100%', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                  <LayoutList size={24} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>Queue is Empty</div>
                <div style={{ fontSize: '12.5px', lineHeight: '1.5', color: '#64748b', maxWidth: '80%' }}>Process a validated document to generate the requirement extraction queue.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Review Detail Workspace (42%) */}
        <div style={{
          flex: '1', background: '#ffffff', display: 'flex', flexDirection: 'column', position: 'relative'
        }}>
          {selectedReq ? (
            <>
              {/* Section A: Header */}
              <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>{selectedReq.id || 'Detail Workspace'}</h2>
                  {selectedReq.status === 'review_needed' ? (
                    <span style={{ fontSize: '11px', padding: '4px 10px', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      <AlertCircle size={12} strokeWidth={2.5} /> Needs Review
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', padding: '4px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '6px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                      <Check size={12} strokeWidth={2.5} /> Ready
                    </span>
                  )}
                </div>
                <button style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#475569', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='#ffffff'}>
                  <Edit2 size={13} strokeWidth={2.5} /> Edit Item
                </button>
              </div>

              {/* Scrollable Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '32px', background: '#f8fafc' }}>
                
                {/* Section B: Requirement Text Block */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={13} /> Extracted Context</span>
                  </div>
                  <div style={{
                    width: '100%', padding: '16px 20px', borderRadius: '8px',
                    background: '#ffffff', fontSize: '14px', color: '#1e293b', lineHeight: '1.6', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
                    border: '1px solid #e2e8f0', borderLeft: '4px solid #cbd5e1'
                  }}>
                    {selectedReq.originalText || selectedReq.normalizedText}
                  </div>
                </div>

                {/* Section C: AI Interpretation */}
                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                   <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', fontSize: '12px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <Cpu size={14} color="#4f46e5" strokeWidth={2.5} /> Analysis & Categorization
                   </div>
                   <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', background: '#f8fafc' }}>
                     <div>
                       <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Inferred Category</div>
                       <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600', textTransform: 'capitalize' }}>{selectedReq.type?.replace('_', ' ') || 'Functional Requirement'}</div>
                     </div>
                     <div>
                       <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Automation Path</div>
                       <div style={{ fontSize: '14px', color: selectedReq.automationCandidate ? '#059669' : '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                         {selectedReq.automationCandidate ? <><Zap size={14} strokeWidth={2.5} fill="#059669" fillOpacity={0.2} /> Highly Automatable</> : 'Manual Testing Advisory'}
                       </div>
                     </div>
                   </div>
                </div>

                {/* Section E: Review Warning Box (If needed) */}
                {selectedReq.status === 'review_needed' && (
                  <div style={{ background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#d97706', background: '#fef3c7', padding: '8px', borderRadius: '8px' }}>
                      <AlertTriangle size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#b45309', marginBottom: '6px' }}>Context Ambiguity Warning</div>
                      <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                        The expected condition boundary is vaguely defined in the source document. Consider verifying exact threshold rules before generating test case permutations.
                      </div>
                    </div>
                  </div>
                )}

                {/* Section D: Derived Test Points */}
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={13} strokeWidth={2.5} /> Derived Test Parameters
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[1,2].map(i => (
                      <div key={i} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px 20px', fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ marginTop: '2px', color: '#94a3b8' }}><Target size={16} strokeWidth={2.5} /></div>
                        <div style={{ lineHeight: '1.6' }}>
                          <span style={{ fontWeight: '600', color: '#1e293b' }}>Param #{i}:</span> Verify system integrity matches explicitly defined logic branches for this requirement context.
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Section F: Sticky Action Bar */}
              <div style={{ position: 'sticky', bottom: 0, padding: '20px 28px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, boxShadow: '0 -4px 6px -4px rgba(0,0,0,0.02)' }}>
                <div>
                  <button style={{ background: 'none', border: 'none', fontSize: '13px', color: '#64748b', fontWeight: '600', cursor: 'pointer', transition: 'color 0.2s', padding: '6px 0', outline: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#ef4444'} onMouseLeave={e=>e.currentTarget.style.color='#64748b'} onClick={(e) => { e.currentTarget.style.color = '#ef4444'; setTimeout(() => e.target.style.color = '#64748b', 1000)}}>Exclude from Scope</button>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => updateRequirement({ ...selectedReq, status: 'review_needed', automationCandidate: false })}
                    style={{ background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} 
                    onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='#ffffff'}
                  >
                    Flag for Manual
                  </button>
                  <button 
                    onClick={() => updateRequirement({ ...selectedReq, status: 'approved' })}
                    style={{ background: '#4f46e5', color: '#ffffff', border: '1px solid #4338ca', borderRadius: '6px', padding: '10px 28px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(79,70,229,0.15)', transition: 'background 0.2s' }} 
                    onMouseEnter={e=>e.currentTarget.style.background='#4338ca'} onMouseLeave={e=>e.currentTarget.style.background='#4f46e5'}
                  >
                    Approve Context
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '32px' }}>
              <div style={{ maxWidth: '380px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px' }}>
                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                    <Layers size={32} color="#94a3b8" strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', margin: 0, letterSpacing: '-0.01em' }}>Review Workbench</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                    Select an item from the extraction queue to inspect its AI categorization and review derived test parameters.
                  </p>
                </div>
                
                {/* Refined Phantom wireframe hints */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: 0.5 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extracted Context</div>
                    <div style={{ height: '72px', width: '100%', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', borderLeft: '3px solid #cbd5e1' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analysis & Categorization</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ height: '56px', flex: 1, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}></div>
                      <div style={{ height: '56px', flex: 1, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
