// components/Connection.jsx - 연결선 컴포넌트
import { ConnectionState, WorkflowNode } from '@/shared/types/workflow';
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
  onDelete: (fromId: string, toId: string) => void;
};

// 기본 연결선 컴포넌트
const Connection = ({ from, to, onDelete }: ConnectionProps) => {
  const handleDelete = () => {
    onDelete(from.id, to.id);
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

// SVG 마커 정의 컴포넌트
export const ConnectionMarkers = () => {
  return (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
      </marker>
      <marker
        id="arrowhead-blue"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
      </marker>
    </defs>
  );
};

// 연결선 컨테이너 컴포넌트
export const ConnectionContainer = ({
  connections,
  nodes,
  connectionState,
  onDeleteConnection,
  getConnectionCoordinates,
}: {
  connections: ConnectionProps[];
  nodes: WorkflowNode[];
  connectionState: ConnectionState;
  onDeleteConnection: (fromId: string, toId: string) => void;
  getConnectionCoordinates: (
    fromId: string,
    toId: string,
  ) => {
    from: { id: string; x: number; y: number };
    to: { id: string; x: number; y: number };
  } | null;
}) => {
  console.log('inner_connections', connections);
  return (
    <svg
      className="pointer-events-none absolute"
      style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 1 }}
    >
      <ConnectionMarkers />

      {/* 기존 연결선들 */}
      {connections.map((conn, index) => {
        const coords = getConnectionCoordinates(conn.from.id, conn.to.id);
        return coords ? (
          <Connection
            key={`${conn.from}-${conn.to}-${index}`}
            from={coords.from}
            to={coords.to}
            onDelete={onDeleteConnection}
          />
        ) : null;
      })}

      {/* 임시 연결선 (드래그 중) */}
      {connectionState.tempLine && connectionState.startNodeId && (
        <TempConnection
          startX={(() => {
            const startNode = nodes.find(
              (n) => n.id === connectionState.startNodeId,
            );
            return startNode ? startNode.x + 200 + 8 : 0;
          })()}
          startY={(() => {
            const startNode = nodes.find(
              (n) => n.id === connectionState.startNodeId,
            );
            return startNode ? startNode.y + 150 / 2 : 0;
          })()}
          endX={connectionState.tempLine.x}
          endY={connectionState.tempLine.y}
        />
      )}
    </svg>
  );
};

export default Connection;
