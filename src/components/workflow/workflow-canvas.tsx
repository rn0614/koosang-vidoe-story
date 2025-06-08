import React, { useRef, useCallback, useState } from 'react';
import Connection from '@/components/workflow/Connection';
import FlowNode from '@/components/workflow/FlowNode';
import type {
  WorkflowNode,
  WorkflowConnection,
  DragState,
  ConnectionState,
  WorkflowNodeState,
} from '@/types/workflow';

interface WorkflowCanvasProps {
  nodes: Record<string, WorkflowNode>;
  setNodes: React.Dispatch<React.SetStateAction<Record<string, WorkflowNode>>>;
  connections: WorkflowConnection[];
  setConnections: React.Dispatch<React.SetStateAction<WorkflowConnection[]>>;
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  updateNode: (nodeId: string, updatedData: Partial<WorkflowNode>) => void;
  handleStatusChange: (nodeId: string, status: WorkflowNodeState) => void;
  handleNodeDelete: (nodeId: string) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  setNodes,
  connections,
  setConnections,
  selectedNodeId,
  setSelectedNodeId,
  updateNode,
  handleStatusChange,
  handleNodeDelete,
}) => {
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
      const node = nodes[nodeId];
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
    [nodes, canvasOffset],
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
        const newX =
          e.clientX - rect.left - dragState.offset.x - canvasOffset.x;
        const newY = e.clientY - rect.top - dragState.offset.y - canvasOffset.y;
        setNodes(prev => ({
          ...prev,
          [dragState.dragNodeId!]: {
            ...prev[dragState.dragNodeId!],
            x: newX,
            y: newY,
          }
        }));
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
            x: e.clientX - rect.left - canvasOffset.x,
            y: e.clientY - rect.top - canvasOffset.y,
          },
        }));
      }
    },
    [dragState, connectionState, isPanning, panStart, canvasOffset, setNodes],
  );

  // 마우스 업 처리
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (connectionState.isConnecting) {
        const target = e.target as HTMLElement;
        const connectionPoint = target.closest(
          '.connection-point',
        ) as HTMLElement;
        if (
          connectionPoint &&
          connectionPoint.dataset.type === 'input' &&
          connectionPoint.dataset.nodeId !== connectionState.startNodeId
        ) {
          const targetNodeId = connectionPoint.dataset.nodeId!;
          setConnections((prev) => {
            const exists = prev.some(
              (conn) =>
                conn.from === connectionState.startNodeId &&
                conn.to === targetNodeId,
            );
            if (!exists && connectionState.startNodeId) {
              return [
                ...prev,
                { from: connectionState.startNodeId, to: targetNodeId },
              ];
            }
            return prev;
          });
          setNodes(prev => {
            const updated = { ...prev };
            if (connectionState.startNodeId && updated[connectionState.startNodeId]) {
              updated[connectionState.startNodeId] = {
                ...updated[connectionState.startNodeId],
                nextFlow: [...(updated[connectionState.startNodeId].nextFlow || []), targetNodeId],
              };
            }
            if (targetNodeId && updated[targetNodeId] && connectionState.startNodeId) {
              updated[targetNodeId] = {
                ...updated[targetNodeId],
                frontFlow: [
                  ...(updated[targetNodeId].frontFlow || []),
                  connectionState.startNodeId,
                ],
                activateCondition: Array.from(new Set([...(updated[targetNodeId].activateCondition || []), connectionState.startNodeId]))
              };
            }
            return updated;
          });
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
    [connectionState, setConnections, setNodes],
  );

  // 연결선 좌표 계산
  const getConnectionCoordinates = useCallback(
    (fromId: string, toId: string) => {
      const fromNode = nodes[fromId];
      const toNode = nodes[toId];
      if (!fromNode || !toNode) return null;
      return {
        from: {
          id: fromId,
          x: fromNode.x + 200, // 노드 우측 연결점
          y: fromNode.y + 75, // 노드 중앙
        },
        to: {
          id: toId,
          x: toNode.x - 8, // 노드 좌측 연결점
          y: toNode.y + 75, // 노드 중앙
        },
      };
    },
    [nodes],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab active:cursor-grabbing overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
    >
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
        {/* 연결선 */}
        <svg
          className="pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
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
                onDelete={() => {
                  // 연결 삭제는 상위에서 처리하는 것이 더 좋으나, 필요시 prop으로 내려받아 처리 가능
                  setConnections(prev => prev.filter(c => !(c.from === conn.from && c.to === conn.to)));
                  setNodes(prev => {
                    const updated = { ...prev };
                    if (updated[conn.from]) {
                      updated[conn.from] = {
                        ...updated[conn.from],
                        nextFlow: (updated[conn.from].nextFlow || []).filter(id => id !== conn.to),
                      };
                    }
                    if (updated[conn.to]) {
                      updated[conn.to] = {
                        ...updated[conn.to],
                        frontFlow: (updated[conn.to].frontFlow || []).filter(id => id !== conn.from),
                      };
                    }
                    return updated;
                  });
                }}
              />
            ) : null;
          })}
          {connectionState.tempLine && connectionState.startNodeId && (
            <line
              x1={(() => {
                const startNode = nodes[connectionState.startNodeId];
                return startNode ? startNode.x + 200 + 8 : 0;
              })()}
              y1={(() => {
                const startNode = nodes[connectionState.startNodeId];
                return startNode ? startNode.y + 150 / 2 : 0;
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
        {/* 노드들 */}
        {Object.values(nodes).map(node => (
          <div key={node.id} data-node={node.id}>
            <FlowNode
              node={node}
              nodes={nodes}
              onNodeUpdate={updateNode}
              onNodeSelect={setSelectedNodeId}
              onConnectionStart={handleConnectionStart}
              onStatusChange={handleStatusChange}
              isSelected={selectedNodeId === node.id}
              isDragging={
                dragState.isDragging && dragState.dragNodeId === node.id
              }
              onDragStart={handleDragStart}
              onNodeDelete={handleNodeDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
};