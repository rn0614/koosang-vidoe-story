// components/workflow/workflow-canvas.tsx
import React, { useRef, useCallback, useState } from 'react';
import Connection from '@/components/workflow/Connection';
import FlowNode from '@/components/workflow/FlowNode';
import { useWorkflowContext, useAllNodeIds } from '@/contexts/WorkflowContext';
import type {
  DragState,
  ConnectionState,
} from '@/types/workflow';

interface WorkflowCanvasProps {
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  selectedNodeId,
  setSelectedNodeId,
}) => {
  const { 
    getNode, 
    updateNode, 
    addConnection, 
    removeConnection, 
    getConnections,
    handleStatusChange,
    deleteNode 
  } = useWorkflowContext();
  
  // 성능 최적화: 노드 ID 목록만 구독
  const nodeIds = useAllNodeIds();
  const connections = getConnections();
  
  // 캔버스 팬 상태
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // 드래그/연결 상태
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragNodeId: null,
    startPos: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    startNodeId: null,
    tempLine: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // 드래그 시작
  const handleDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const node = getNode(nodeId);
      if (!node) return;
      
      e.preventDefault();
      document.body.style.userSelect = 'none';
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      setDragState({
        isDragging: true,
        dragNodeId: nodeId,
        startPos: { x: e.clientX, y: e.clientY },
        offset: {
          x: e.clientX - rect.left - node.x - canvasOffset.x,
          y: e.clientY - rect.top - node.y - canvasOffset.y,
        },
      });
    },
    [getNode, canvasOffset],
  );

  // 연결 시작
  const handleConnectionStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setConnectionState({
        isConnecting: true,
        startNodeId: nodeId,
        tempLine: null,
      });
    },
    [],
  );

  // 캔버스 팬 시작
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-node]') ||
      target.closest('.connection-point') ||
      target.closest('line') ||
      target.closest('circle') ||
      target.closest('text') ||
      target.closest('button')
    ) {
      return;
    }
    setSelectedNodeId(null);
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  }, [setSelectedNodeId]);

  // 마우스 이동 처리
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // 노드 드래그 처리
      if (dragState.isDragging && dragState.dragNodeId) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const newX = e.clientX - rect.left - dragState.offset.x - canvasOffset.x;
        const newY = e.clientY - rect.top - dragState.offset.y - canvasOffset.y;
        
        updateNode(dragState.dragNodeId, { x: newX, y: newY });
      }
      
      // 캔버스 팬 처리
      if (isPanning) {
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        setCanvasOffset((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
      
      // 연결선 드래그 처리
      if (connectionState.isConnecting) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setConnectionState((prev) => ({
          ...prev,
          tempLine: {
            x: e.clientX - rect.left, // 캔버스 오프셋 제거 (절대 좌표 사용)
            y: e.clientY - rect.top,  // 캔버스 오프셋 제거 (절대 좌표 사용)
          },
        }));
      }
    },
    [dragState, connectionState, isPanning, panStart, canvasOffset, updateNode],
  );

  // 마우스 업 처리
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (connectionState.isConnecting) {
        const target = e.target as HTMLElement;
        const connectionPoint = target.closest('.connection-point') as HTMLElement;
        
        if (
          connectionPoint &&
          connectionPoint.dataset.type === 'input' &&
          connectionPoint.dataset.nodeId !== connectionState.startNodeId
        ) {
          const targetNodeId = connectionPoint.dataset.nodeId!;
          if (connectionState.startNodeId) {
            addConnection(connectionState.startNodeId, targetNodeId);
          }
        }
      }
      
      // 모든 드래그/팬 상태 해제
      setDragState({
        isDragging: false,
        dragNodeId: null,
        startPos: { x: 0, y: 0 },
        offset: { x: 0, y: 0 },
      });
      setConnectionState({
        isConnecting: false,
        startNodeId: null,
        tempLine: null,
      });
      setIsPanning(false);
      setPanStart({ x: 0, y: 0 });
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    },
    [connectionState, addConnection],
  );

  // 연결선 좌표 계산 (캔버스 오프셋 포함)
  const getConnectionCoordinates = useCallback(
    (fromId: string, toId: string) => {
      const fromNode = getNode(fromId);
      const toNode = getNode(toId);
      if (!fromNode || !toNode) return null;
      
      return {
        from: {
          id: fromId,
          x: fromNode.x + 200 + canvasOffset.x, // 캔버스 오프셋 포함
          y: fromNode.y + 75 + canvasOffset.y,  // 캔버스 오프셋 포함
        },
        to: {
          id: toId,
          x: toNode.x - 8 + canvasOffset.x,  // 캔버스 오프셋 포함
          y: toNode.y + 75 + canvasOffset.y,  // 캔버스 오프셋 포함
        },
      };
    },
    [getNode, canvasOffset],
  );

  // 연결 삭제 처리
  const handleDeleteConnection = useCallback((fromId: string, toId: string) => {
    removeConnection(fromId, toId);
  }, [removeConnection]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab active:cursor-grabbing overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
    >
      {/* 연결선 SVG - 캔버스 변환 컨테이너 밖에 위치 */}
      <svg
        className="pointer-events-none absolute inset-0"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 10, // 노드들보다 위에 표시
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
        
        {connections.map((conn, index) => {
          const coords = getConnectionCoordinates(conn.from, conn.to);
          return coords ? (
            <Connection
              key={`${conn.from}-${conn.to}-${index}`}
              from={coords.from}
              to={coords.to}
              onDelete={() => handleDeleteConnection(conn.from, conn.to)}
            />
          ) : null;
        })}
        
        {connectionState.tempLine && connectionState.startNodeId && (
          <line
            x1={(() => {
              const startNode = getNode(connectionState.startNodeId);
              return startNode ? startNode.x + 200 + 8 + canvasOffset.x : 0;
            })()}
            y1={(() => {
              const startNode = getNode(connectionState.startNodeId);
              return startNode ? startNode.y + 150 / 2 + canvasOffset.y : 0;
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

      {/* 캔버스 변환 컨테이너 */}
      <div
        className="absolute"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          left: 0,
          top: 0,
          width: '300%',
          height: '300%',
        }}
      >
        {/* 배경 그리드 */}
        <div
          className="absolute opacity-20"
          style={{
            left: -canvasOffset.x,
            top: -canvasOffset.y,
            width: '200vw',
            height: '200vh',
          }}
        >
          <svg className="h-full w-full">
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 노드들 - 최적화된 렌더링 */}
        {nodeIds.map(nodeId => (
          <div key={nodeId} data-node={nodeId}>
            <FlowNode
              nodeId={nodeId} // 🎯 ID만 전달!
              onNodeSelect={setSelectedNodeId}
              onConnectionStart={handleConnectionStart}
              onStatusChange={handleStatusChange}
              isSelected={selectedNodeId === nodeId}
              isDragging={dragState.isDragging && dragState.dragNodeId === nodeId}
              onDragStart={handleDragStart}
              onNodeDelete={deleteNode}
            />
          </div>
        ))}
      </div>
    </div>
  );
};