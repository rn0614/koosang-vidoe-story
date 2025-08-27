// components/workflow/ConnectionLayer.tsx
import React from 'react';
import Connection from '@/features/workflow/components/Connection';
import type { WorkflowConnection, ConnectionState } from '@/shared/types/workflow';
import { getConnectionCoordinates, getTempConnectionStartCoords } from '@/shared/lib/coordinateUtils';

interface ConnectionLayerProps {
  visibleConnections: WorkflowConnection[];
  coordinateCache: Map<string, { x: number; y: number }>;
  canvasOffset: { x: number; y: number };
  connectionState: ConnectionState;
  onDeleteConnection: (fromId: string, toId: string) => void;
}

export const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
  visibleConnections,
  coordinateCache,
  canvasOffset,
  connectionState,
  onDeleteConnection,
}) => {
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      style={{
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
      }}
    >
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
      </defs>
      
      {/* 기존 연결선들 */}
      {visibleConnections.map((conn, index) => {
        const coords = getConnectionCoordinates(conn.from, conn.to, coordinateCache, canvasOffset);
        return coords ? (
          <Connection
            key={`${conn.from}-${conn.to}-${index}`}
            from={coords.from}
            to={coords.to}
            onDelete={() => onDeleteConnection(conn.from, conn.to)}
          />
        ) : null;
      })}
      
      {/* 임시 연결선 (드래그 중) */}
      {connectionState.tempLine && connectionState.startNodeId && (
        <line
          x1={(() => {
            const startCoords = getTempConnectionStartCoords(
              connectionState.startNodeId,
              coordinateCache,
              canvasOffset
            );
            return startCoords?.x || 0;
          })()}
          y1={(() => {
            const startCoords = getTempConnectionStartCoords(
              connectionState.startNodeId,
              coordinateCache,
              canvasOffset
            );
            return startCoords?.y || 0;
          })()}
          x2={connectionState.tempLine.x}
          y2={connectionState.tempLine.y}
          stroke="#3B82F6"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="pointer-events-none"
        />
      )}
    </svg>
  );
};

