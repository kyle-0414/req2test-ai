import React, { useState } from 'react';
import { Upload, Image as ImageIcon, FileText, CheckCircle, Search, Layers, PlayCircle, X, Check, File } from 'lucide-react';
import { Badge } from '../ui/Badges';

export const UploadScreen = ({ onAnalyze, text, setText }) => {
  const [docType, setDocType] = useState('Requirements Document');
  const [files, setFiles] = useState([
    { name: 'login_requirements_v2.pdf', type: 'PDF', size: '2.4 MB', status: 'ready' }
  ]);

  const docTypes = [
    'Requirements Document',
    'Screen Spec',
    'Change Request',
    'Screenshot / Capture',
    'Other'
  ];

  return (
    <div className="animate-in" style={{ 
      background: '#f8fafc', /* very light gray */
      minHeight: '100%', 
      display: 'flex',
      flexDirection: 'row',
      gap: '32px',
      padding: '40px 48px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Left Column (55%) */}
      <div style={{ flex: '55%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Hero Message Block */}
        <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#0f172a', /* dark slate */
            letterSpacing: '-0.02em',
            marginBottom: '12px'
          }}>
            문서를 올리면 테스트 설계가 시작됩니다
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: '#64748b', /* muted slate */
            lineHeight: '1.6',
            maxWidth: '540px'
          }}>
            Upload requirement documents, images, or screenshots. AI will extract requirement items, discover test points, and generate draft test cases automatically.
          </p>
        </div>

        {/* Value Pills */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { icon: <Search size={14} />, text: 'Requirement Extraction' },
            { icon: <Layers size={14} />, text: 'Test Point Discovery' },
            { icon: <PlayCircle size={14} />, text: 'Draft Test Case Generation' }
          ].map((pill, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '99px',
              background: '#e0e7ff', /* indigo-100 */
              color: '#3730a3', /* indigo-800 */
              fontSize: '13px', fontWeight: '600'
            }}>
              {pill.icon}
              {pill.text}
            </div>
          ))}
        </div>

        {/* Main Upload Dropzone */}
        <div style={{
          background: '#ffffff',
          border: '2px dashed #cbd5e1',
          borderRadius: '24px', /* 2xl */
          padding: '48px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#4f46e5'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: '#eef2ff', color: '#4f46e5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <Upload size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            Drag and drop files here
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
            Support for PDF, DOCX, PNG, JPG, TXT up to 50MB
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              background: '#4f46e5', color: '#ffffff',
              border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: '14px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(79,70,229,0.2)'
            }}>
              <File size={16} /> Upload File
            </button>
            <button style={{
              background: '#ffffff', color: '#4f46e5',
              border: '1px solid #4f46e5', borderRadius: '8px',
              padding: '10px 20px', fontSize: '14px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}>
              <ImageIcon size={16} /> Upload Image
            </button>
          </div>
        </div>

        {/* Document Type Selector */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '12px' }}>
            Document Type
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {docTypes.map(t => (
              <button key={t} onClick={() => setDocType(t)} style={{
                background: docType === t ? '#4f46e5' : '#f1f5f9',
                color: docType === t ? '#ffffff' : '#475569',
                border: 'none', borderRadius: '99px',
                padding: '6px 16px', fontSize: '13px', fontWeight: docType === t ? '600' : '500',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Upload Queue</div>
          {files.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#ffffff', borderRadius: '12px', padding: '12px 16px',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: '#4f46e5' }}><FileText size={18} /></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{f.name}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{f.type} • {f.size}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#059669', fontWeight: '500' }}>
                  <CheckCircle size={14} /> Ready
                </div>
                <button style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }} title="Remove">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Right Column (45%) */}
      <div style={{ flex: '45%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Text Input Section */}
        <div style={{
          background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', flex: 1
        }}>
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color="#4f46e5" /> Manual Requirement Input
            </div>
            <button style={{
              background: 'none', border: 'none', color: '#4f46e5',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer'
            }}>
              Load Sample
            </button>
          </div>
          <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Paste requirement text directly. It acts as an alternative input path.
            </p>
            <textarea
              style={{
                flex: 1, width: '100%', minHeight: '200px',
                border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '16px', fontSize: '14px', color: '#334155',
                lineHeight: '1.6', resize: 'none', outline: 'none',
                background: '#f8fafc'
              }}
              placeholder="Paste text here..."
              value={text}
              onChange={e => setText(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{text.length} characters</span>
              <button
                onClick={() => onAnalyze(text)}
                disabled={text.length === 0}
                style={{
                  background: '#4f46e5', color: '#ffffff',
                  border: 'none', borderRadius: '8px',
                  padding: '10px 24px', fontSize: '14px', fontWeight: '600',
                  opacity: text.length === 0 ? 0.5 : 1,
                  cursor: text.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 2px 4px rgba(79,70,229,0.2)'
                }}
              >
                <Search size={16} /> Analyze Input
              </button>
            </div>
          </div>
        </div>

        {/* "What AI will do" summary card */}
        <div style={{
          background: '#1e293b', /* dark slate */
          borderRadius: '24px', padding: '24px',
          color: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ZapIcon size={18} color="#e0e7ff" /> What happens next?
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Extract functions, conditions, expected results',
              'Identify ambiguous requirements',
              'Suggest automation candidates',
              'Generate draft test cases'
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#4ade80', marginTop: '2px' }}><Check size={14} /></div>
                <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.4' }}>{item}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper icon
const ZapIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);
