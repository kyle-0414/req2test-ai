import React, { useState, useEffect, useCallback } from 'react';
import { useUploadFlow } from '../../hooks/useUploadFlow';
import { createImageSourceDocument } from '../../utils/file';
import { Upload, Image as ImageIcon, FileText, CheckCircle, Search, Layers, PlayCircle, X, Check, File, Zap, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badges';

export const UploadScreen = ({ onAnalyze, text, setText }) => {
  const [docType, setDocType] = useState('Requirements Document');
  const { documents } = useUploadFlow();

  const docTypes = [
    'Requirements Document',
    'Screen Spec',
    'Change Request',
    'Capture',
    'Other'
  ];

  const handlePaste = useCallback((e) => {
    // Only intercept if there's an image. Text paste still needs to work for the textarea.
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        // Stop default to prevent double action or default browser viewing
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const extension = file.type.split('/')[1] || 'png';
          // Ensure file has a name
          const renamedFile = new File([file], `pasted-image-${Date.now()}.${extension}`, { type: file.type });
          const sourceDoc = createImageSourceDocument(renamedFile, docType);
          addDocument(sourceDoc);
        }
      }
    }
  }, [docType, addDocument]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      // only accept images for this phase
      files.forEach((file) => {
        if (file.type.indexOf('image/') === 0) {
          const sourceDoc = createImageSourceDocument(file, docType);
          addDocument(sourceDoc);
        }
      });
    }
  };


  return (
    <div className="animate-in" style={{ 
      background: '#f8fafc', /* very light gray */
      minHeight: '100%', 
      display: 'flex',
      flexDirection: 'row',
      gap: '48px', /* Increased gap for better balance */
      padding: '48px 56px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Left Column (55%) */}
      <div style={{ flex: '55%', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        
        {/* 1. Hero Message Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#0f172a', /* dark slate */
              letterSpacing: '-0.03em',
              lineHeight: '1.25',
              marginBottom: '16px'
            }}>
              문서를 올리면<br/>테스트 설계가 시작됩니다
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: '#475569', 
              lineHeight: '1.6',
              maxWidth: '480px',
              fontWeight: '400'
            }}>
              Upload requirement documents, images, or screenshots. AI will extract requirement items, discover test points, and generate draft test cases automatically.
            </p>
          </div>

          {/* Value Pills */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { icon: <Search size={14} strokeWidth={2.5} />, text: 'Requirement Extraction' },
              { icon: <Layers size={14} strokeWidth={2.5} />, text: 'Test Point Discovery' },
              { icon: <PlayCircle size={14} strokeWidth={2.5} />, text: 'Draft Test Case Generation' }
            ].map((pill, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '99px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontSize: '13px', fontWeight: '600',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <span style={{ color: '#4f46e5' }}>{pill.icon}</span>
                {pill.text}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Main Upload Dropzone */}
        <div style={{
          background: '#ffffff',
          border: '2px dashed #e2e8f0', /* subtle border */
          borderRadius: '24px', 
          padding: '56px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 20px -4px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#818cf8';
          e.currentTarget.style.background = '#fafafa';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.background = '#ffffff';
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#f1f5f9', color: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <Upload size={32} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
            Drop files to start analysis
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
            Support for PDF, DOCX, PNG, JPG up to 50MB
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{
              background: '#4f46e5', color: '#ffffff',
              border: 'none', borderRadius: '10px',
              padding: '12px 24px', fontSize: '14px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(79,70,229,0.3)'
            }}>
              <File size={18} /> Upload File
            </button>
            <button style={{
              background: '#ffffff', color: '#1e293b',
              border: '1px solid #cbd5e1', borderRadius: '10px',
              padding: '12px 24px', fontSize: '14px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <ImageIcon size={18} color="#64748b" /> Upload Image
            </button>
          </div>
        </div>

        {/* 6. Document Type Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', paddingLeft: '4px' }}>
            Document Context
          </div>
          <div style={{ 
            display: 'inline-flex', background: '#f1f5f9', padding: '6px', borderRadius: '16px', flexWrap: 'wrap', gap: '4px' 
          }}>
            {docTypes.map(t => (
              <button key={t} onClick={() => setDocType(t)} style={{
                background: docType === t ? '#ffffff' : 'transparent',
                color: docType === t ? '#0f172a' : '#64748b',
                border: 'none', borderRadius: '12px',
                padding: '8px 16px', fontSize: '13px', fontWeight: docType === t ? '600' : '500',
                boxShadow: docType === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Upload Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {documents.map((f, i) => (
            <div key={f.id || i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#ffffff', borderRadius: '16px', padding: '16px 20px',
              border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {f.previewUrl ? (
                  <img src={f.previewUrl} alt={f.fileName} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '10px' }} />
                ) : (
                  <div style={{ 
                    background: '#eef2ff', color: '#4f46e5', padding: '10px', borderRadius: '10px'
                  }}>
                    <FileText size={20} />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{f.fileName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                    {f.fileType?.toUpperCase()} <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span> {f.size ? `${(f.size / 1000000).toFixed(1)} MB` : '2.4 MB'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                  <CheckCircle size={16} /> Ready
                </div>
                <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }} title="Remove">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Right Column (45%) */}
      <div style={{ flex: '45%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* 2. Text Input Section */}
        <div style={{
          background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', flex: 1
        }}>
          <div style={{
            padding: '28px 32px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#4f46e5" /> Smart Manual Input
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
                Paste requirement text directly for instant AI analysis.
              </div>
            </div>
            <button style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569',
              borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.2s'
            }}>
              Load Sample
            </button>
          </div>

          <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            <textarea
              style={{
                flex: 1, width: '100%', minHeight: '260px',
                border: 'none',
                fontSize: '15px', color: '#1e293b',
                lineHeight: '1.7', resize: 'none', outline: 'none',
                background: 'transparent',
                fontWeight: '400'
              }}
              placeholder="Start typing or paste your requirements here...&#10;&#10;E.g.,&#10;'When the user clicks the info icon, it should open the details modal...' "
              value={text}
              onChange={e => setText(e.target.value)}
            />
            
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' 
            }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                {text.length === 0 ? '0 characters' : `${text.length} characters`} · AI is ready
              </span>
              <button
                onClick={() => onAnalyze(text)}
                disabled={text.length === 0}
                style={{
                  background: text.length > 0 ? '#0f172a' : '#f1f5f9', 
                  color: text.length > 0 ? '#ffffff' : '#94a3b8',
                  border: 'none', borderRadius: '12px',
                  padding: '12px 28px', fontSize: '14px', fontWeight: '600',
                  cursor: text.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: text.length > 0 ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <Zap size={16} fill={text.length > 0 ? "#ffffff" : "none"} /> Analyze Text
              </button>
            </div>
          </div>
        </div>

        {/* 5. "What happens next?" summary card */}
        <div style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '24px', padding: '32px',
          color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <h4 style={{ 
            fontSize: '13px', fontWeight: '700', marginBottom: '20px', 
            textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8',
            display: 'flex', alignItems: 'center', gap: '8px' 
          }}>
            Analysis Workflow
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Extract functions, conditions, expected results',
              'Identify ambiguous requirements',
              'Suggest automation candidates',
              'Generate draft test cases'
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', 
                  width: '24px', height: '24px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Check size={14} strokeWidth={3} />
                </div>
                <div style={{ fontSize: '14.5px', color: '#e2e8f0', fontWeight: '500' }}>{item}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
