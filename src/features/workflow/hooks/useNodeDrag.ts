// hooks/useNodeDrag.ts
import { useState, useCallback, useRef } from 'react';
import type { DragState } from '../types';

interface NodeDragActions {
  dragState: DragState;
  handleDragStart: (nodeId: string, e: React.MouseEvent, getNode: (id: string) => any, canvasOffset: { x: number; y: number }, containerRef: React.RefObject<HTMLDivElement>) => void;
  updateDragPosition: (nodeId: string, x: number, y: number) => void;
  endDrag: (updateNode?: (nodeId: string, updates: any) => void) => void;
}

export const useNodeDrag = (): NodeDragActions => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragNodeId: null,
    startPos: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
  });

  const pendingDrag = useRef<{ nodeId: string; x: number; y: number } | null>(null);

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

  const updateDragPosition = useCallback((nodeId: string, x: number, y: number) => {
    pendingDrag.current = { nodeId, x, y };
  }, []);

  const endDrag = useCallback((updateNode?: (nodeId: string, updates: any) => void) => {
    // Apply pending position update if exists
    if (pendingDrag.current && updateNode) {
      const { nodeId, x, y } = pendingDrag.current;
      updateNode(nodeId, { x, y });
    }
    
    setDragState({
      isDragging: false,
      dragNodeId: null,
      startPos: { x: 0, y: 0 },
      offset: { x: 0, y: 0 },
    });
    pendingDrag.current = null;
  }, []);

  return {
    dragState,
    handleDragStart,
    updateDragPosition,
    endDrag,
  };
};

