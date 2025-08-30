// features/workflow/components/Connection.tsx - 연결선 기능 컴포넌트
import React from 'react';

type ConnectionProps = {
  from: {
    id: string;
    x: number;
    y: number;
  };
  to: {
    id: string;
    x: number;
    y: number;
  };
  onDelete: () => void;
};

// 기본 연결선 컴포넌트
export const Connection = ({ from, to, onDelete }: ConnectionProps) => {
  const handleDelete = () => {
    onDelete();
  };

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#6B7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
        className="cursor-pointer hover:stroke-red-500"
        onClick={handleDelete}
      />
      <circle
        cx={(from.x + to.x) / 2}
        cy={(from.y + to.y) / 2}
        r="8"
        fill="#EF4444"
        className="cursor-pointer opacity-0 hover:opacity-100"
        onClick={handleDelete}
      />
      <text
        x={(from.x + to.x) / 2}
        y={(from.y + to.y) / 2 + 1}
        textAnchor="middle"
        className="pointer-events-none fill-white text-xs opacity-0 hover:opacity-100"
      >
        ×
      </text>
    </g>
  );
};

// 임시 연결선 컴포넌트 (드래그 중)
export const TempConnection = ({
  startX,
  startY,
  endX,
  endY,
}: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}) => {
  return (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke="#3B82F6"
      strokeWidth="2"
      strokeDasharray="5,5"
      className="pointer-events-none"
    />
  );
};