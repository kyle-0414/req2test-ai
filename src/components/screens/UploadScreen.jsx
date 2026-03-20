import React, { useState } from 'react';
import { Upload, Search, Layers, Zap, FileText } from 'lucide-react';
import { Badge } from '../ui/Badges';

export const UploadScreen = ({ onAnalyze, text, setText }) => {
  const [docType, setDocType] = useState('요구사항 문서');

  return (
    <div className="animate-in">
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h1 className="page-title">요구사항 입력</h1>
        <p className="page-subtitle">문서, 이미지, 텍스트를 업로드하면 AI가 테스트 포인트와 TC 초안을 생성합니다</p>
      </div>

      <div className="upload-area">
        {/* Left: Dropzone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="dropzone">
            <div className="dropzone-icon">
              <Upload size={22} />
            </div>
            <div className="dropzone-title">파일 또는 이미지 업로드</div>
            <p className="dropzone-sub">드래그 & 드롭 또는 클릭하여 선택</p>
            <div className="dropzone-types">
              {['PDF', 'DOCX', 'PNG', 'JPG', 'TXT'].map(t => (
                <span key={t} className="filetype-tag">{t}</span>
              ))}
            </div>
          </div>

          <div className="card card-sm">
            <div className="card-body">
              <div className="text-xs text-muted font-semibold" style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                문서 유형 선택
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['요구사항 문서', '화면 설계서', '변경 요청서', '기획 캡처', '기타'].map(t => (
                  <button
                    key={t}
                    onClick={() => setDocType(t)}
                    className={`btn btn-sm ${docType === t ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Text Input */}
        <div className="text-input-panel" style={{ minHeight: 320 }}>
          <div className="text-input-header">
            <div className="text-input-title">
              <FileText size={14} /> 요구사항 직접 입력
            </div>
            <Badge type="info">{docType}</Badge>
          </div>
          <textarea
            className="req-textarea"
            placeholder="기능 설명, 사용자 스토리, 화면 설명 등을 입력하세요...

예시:
[기능] Info 아이콘 클릭 시 SW 버전 화면 진입
- 위치: 앱 홈 우상단 원형 버튼
- 진입 후: SW Version, Build Date 표시
- 뒤로가기: App Home 복귀"
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <div className="text-input-footer">
            <span className="text-xs text-muted">{text.length} 자</span>
            <button
              onClick={() => onAnalyze(text)}
              className="btn btn-primary"
              disabled={text.length === 0}
              style={{ opacity: text.length === 0 ? 0.5 : 1 }}
            >
              <Zap size={14} /> AI 분석 시작
            </button>
          </div>
        </div>
      </div>

      {/* AI Features Summary */}
      <div style={{ padding: '0 28px 28px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { icon: <Search size={16}/>, title: '요구사항 추출', desc: '기능/조건/예외/기대결과 자동 분류' },
          { icon: <Layers size={16}/>, title: '테스트 포인트 도출', desc: '정상/예외/경계값 케이스 분석' },
          { icon: <FileText size={16}/>, title: 'TC 초안 자동 생성', desc: '우선순위·자동화 후보 판단 포함' },
          { icon: <Zap size={16}/>, title: '자동화 변환 준비', desc: '승인된 TC를 AI 실행으로 연결' },
        ].map((f, i) => (
          <div key={i} className="card card-sm">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: 'var(--color-primary)' }}>{f.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{f.title}</span>
              </div>
              <p className="text-xs text-muted">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
