import React from 'react';

export const Badge = ({ type, children, style }) => (
  <span className={`badge badge-${type}`} style={style}>{children}</span>
);

export const ConfBadge = ({ conf }) =>
  conf === 'High' ? <Badge type="success">신뢰도 높음</Badge>
                  : <Badge type="warning">신뢰도 보통</Badge>;

export const PriorityBadge = ({ p }) =>
  p === '높음' ? <Badge type="danger">높음</Badge>
  : p === '중간' ? <Badge type="warning">중간</Badge>
                 : <Badge type="neutral">낮음</Badge>;

export const RunStatusBadge = ({ status }) => {
  if (!status) return <Badge type="neutral">대기</Badge>;
  if (status === 'pass') return <Badge type="pass">✓ Pass</Badge>;
  if (status === 'fail') return <Badge type="fail">✗ Fail</Badge>;
  if (status === 'review') return <Badge type="review">검토 필요</Badge>;
  if (status === 'running') return <Badge type="info">실행 중...</Badge>;
  return null;
};
