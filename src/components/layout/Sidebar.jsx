import React from 'react';
import { Upload, Search, Layers, Zap, History, BarChart3 } from 'lucide-react';

const NavItem = ({ icon, label, badge, active, onClick, disabled }) => (
  <button
    className={`nav-item${active ? ' active' : ''}`}
    onClick={onClick}
    disabled={disabled}
    style={{ opacity: disabled ? 0.4 : 1 }}
  >
    {icon}
    <span className="nav-item-label">{label}</span>
    {badge != null && <span className="nav-badge">{badge}</span>}
  </button>
);

export const Sidebar = ({ screen, setScreen }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <BarChart3 size={17} color="#fff" />
        </div>
        <span className="sidebar-logo-name">Req2Test <span>AI</span></span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">핵심 흐름</div>
        <NavItem icon={<Upload size={15}/>} label="요구사항 입력" active={screen === 'upload'} onClick={() => setScreen('upload')} />
        <NavItem icon={<Search size={15}/>} label="요구사항 분석" active={screen === 'analysis'} onClick={() => setScreen('analysis')} />
        <NavItem icon={<Layers size={15}/>} label="TC 검토 / 승인" active={screen === 'tc'} onClick={() => setScreen('tc')} />

        <div className="sidebar-section-label" style={{ marginTop: 20 }}>자동화 실행</div>
        <NavItem icon={<Zap size={15}/>} label="AI 실행" disabled />
        <NavItem icon={<History size={15}/>} label="실행 이력" disabled />
        <NavItem icon={<BarChart3 size={15}/>} label="결과 리포트" disabled />
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">K</div>
          <div>
            <div className="sidebar-user-name">Kyle</div>
            <div className="sidebar-user-plan">Premium Plan</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
