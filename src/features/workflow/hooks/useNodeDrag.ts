// hooks/useNodeDrag.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import type { DragState } from '../types';

interface NodeDragActions {
  dragState: DragState;
  ghostPosition: { x: number; y: number } | null; // ✅ Ghost 노드 위치
  handleDragStart: (nodeId: string, e: React.MouseEvent, getNode: (id: string) => any, canvasOffset: { x: number; y: number }, containerRef: React.RefObject<HTMLDivElement>) => void;
  updateGhostPosition: (x: number, y: number) => void; // ✅ Ghost 위치 업데이트
  endDrag: (updateNode?: (nodeId: string, updates: any) => void) => void;
}

export const useNodeDrag = (): NodeDragActions => {
  // console.log('[RENDER] useNodeDrag');

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragNodeId: null,
    startPos: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });

  // ✅ useRef로 RAF 관리 및 성능 최적화
  const rafIdRef = useRef<number | null>(null);
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);

  // ✅ 안정화된 handleDragStart
  const handleDragStart = useCallback((
    nodeId: string, 
    e: React.MouseEvent, 
    getNode: (id: string) => any, 
    canvasOffset: { x: number; y: number },
    containerRef: React.RefObject<HTMLDivElement>
  ) => {
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
  }, []);

  // ✅ RAF로 throttle된 ghost position 업데이트
  const updateGhostPosition = useCallback((x: number, y: number) => {
    // 이전 RAF 요청 취소
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    // 새로운 RAF 요청
    rafIdRef.current = requestAnimationFrame(() => {
      setGhostPosition({ x, y });
      rafIdRef.current = null;
    });
  }, []);

  // ✅ 안정화된 endDrag
  const endDrag = useCallback((updateNode?: (nodeId: string, updates: any) => void) => {
    // RAF 요청 취소
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // ✅ Drop할 때만 실제 노드 위치 업데이트
    if (dragState.dragNodeId && ghostPosition && updateNode) {
      updateNode(dragState.dragNodeId, { 
        x: ghostPosition.x, 
        y: ghostPosition.y 
      });
    }
    
    // 상태 초기화
    setDragState({
      isDragging: false,
      dragNodeId: null,
      startPos: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
    });
    setGhostPosition(null);
  }, [dragState.dragNodeId, ghostPosition]);

  // ✅ cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    dragState,
    ghostPosition,
    handleDragStart,
    updateGhostPosition,
    endDrag,
  };
};

