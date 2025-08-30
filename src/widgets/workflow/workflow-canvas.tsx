// widgets/workflow/workflow-canvas.tsx
import { useWorkflowStore } from '@/features/workflow';
import React, { useRef, useCallback } from 'react';
import { BackgroundGrid } from '@/shared/ui/background-grid';
import { ConnectionLayer } from './connection-layer';
import { NodeLayer } from './node-layer';
import { useCanvasPan } from '@/features/3d-visualization/hooks/useCanvasPan';
import { useNodeDrag } from '@/features/workflow/hooks/useNodeDrag';
import { useConnectionDrag } from '@/features/workflow/hooks/useConnectionDrag';
import { useVirtualRendering } from '@/features/3d-visualization/hooks/useVirtualRendering';
import { useRAFThrottling } from '@/features/3d-visualization/hooks/useRAFThrottling';
import { getCanvasRelativePosition, calculateDragPosition } from '@/shared/lib/coordinateUtils';

interface WorkflowCanvasProps {
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  selectedNodeId,
  setSelectedNodeId,
}) => {
  console.log('[RENDER] WorkflowCanvas - Widget Layer');
  
  // Zustand store subscriptions
  const store = useWorkflowStore();
  const nodeIds = store((state) => state.nodeIds); // ✅ 캐시된 배열 직접 구독
  const connections = store((state) => state.connections); // ✅ 캐시된 배열 직접 구독
  const connectionVersion = store((state) => state.connectionVersion); // ✅ Connection 리렌더링 트리거
  const getNode = store((state) => state.getNode);
  const updateNode = store((state) => state.updateNode);
  const addConnection = store((state) => state.addConnection);
  const removeConnection = store((state) => state.removeConnection);
  const handleStatusChange = store((state) => state.handleStatusChange);
  const deleteNode = store((state) => state.deleteNode);
  const containerRef = useRef<HTMLDivElement>(null);

  // 분리된 Hook들 사용
  const {
    canvasOffset,
    isPanning,
    panStart,
    handleCanvasPointerDown,
    updatePanDelta,
    updatePanStart,
    endPan,
  } = useCanvasPan();

  const {
    dragState,
    handleDragStart: baseDragStart,
    updateDragPosition,
    endDrag,
  } = useNodeDrag();

  const {
    connectionState,
    handleConnectionStart,
    updateConnectionLine,
    handleConnectionEnd,
    endConnection,
  } = useConnectionDrag();

  const {
    coordinateCache,
    visibleNodeIds,
    visibleConnections,
  } = useVirtualRendering({
    nodeIds,
    connections,
    getNode,
    canvasOffset,
    containerRef,
    connectionVersion, // ✅ Connection 버전 의존성 추가
  });

  const {
    scheduleNodeUpdate,
    schedulePanUpdate,
  } = useRAFThrottling();

  // 최적화된 핸들러들
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, [setSelectedNodeId]);

  const handleDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    baseDragStart(nodeId, e, getNode, canvasOffset, containerRef);
  }, [baseDragStart, getNode, canvasOffset]);

  const handleDeleteConnection = useCallback((fromId: string, toId: string) => {
    removeConnection(fromId, toId);
  }, [removeConnection]);

  // 통합된 포인터 이벤트 핸들러들
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    handleCanvasPointerDown(e, setSelectedNodeId);
  }, [handleCanvasPointerDown, setSelectedNodeId]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // 노드 드래그 처리
    if (dragState.isDragging && dragState.dragNodeId) {
      const newPos = calculateDragPosition(
        e.clientX, 
        e.clientY, 
        rect, 
        dragState.offset, 
        canvasOffset
      );
      scheduleNodeUpdate(dragState.dragNodeId, newPos.x, newPos.y, updateNode);
    }
    
    // 캔버스 팬 처리
    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      schedulePanUpdate(deltaX, deltaY, updatePanDelta);
      updatePanStart(e.clientX, e.clientY);
    }
    
    // 연결선 드래그 처리 (즉시 처리)
    if (connectionState.isConnecting) {
      const canvasPos = getCanvasRelativePosition(e.clientX, e.clientY, rect);
      updateConnectionLine(canvasPos.x, canvasPos.y);
    }
  }, [
    dragState, 
    isPanning, 
    panStart, 
    connectionState, 
    canvasOffset,
    scheduleNodeUpdate,
    schedulePanUpdate,
    updateNode,
    updatePanDelta,
    updatePanStart,
    updateConnectionLine
  ]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    // 연결 처리
    handleConnectionEnd(e, addConnection);
    
    // 상태 정리
    endDrag();
    endConnection();
    endPan();
    
    // 포인터 캡처 해제
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  }, [handleConnectionEnd, addConnection, endDrag, endConnection, endPan]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-grab active:cursor-grabbing overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerDown={handlePointerDown}
      style={{ touchAction: 'none' }}
    >
      {/* Connection Layer */}
      <ConnectionLayer
        visibleConnections={visibleConnections}
        coordinateCache={coordinateCache}
        canvasOffset={canvasOffset}
        connectionState={connectionState}
        onDeleteConnection={handleDeleteConnection}
      />

      {/* Canvas Transform Container */}
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
        {/* Background Grid */}
        <BackgroundGrid canvasOffset={canvasOffset} />

        {/* Node Layer */}
        <NodeLayer
          visibleNodeIds={visibleNodeIds}
          getNode={getNode}
          selectedNodeId={selectedNodeId}
          dragState={dragState}
          onNodeSelect={handleNodeSelect}
          onConnectionStart={handleConnectionStart}
          onDragStart={handleDragStart}
          onStatusChange={handleStatusChange}
          onNodeDelete={deleteNode}
        />
      </div>
    </div>
  );
};
