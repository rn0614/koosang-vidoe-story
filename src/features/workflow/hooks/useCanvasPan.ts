// hooks/useCanvasPan.ts
import { useState, useCallback, useRef } from 'react';

interface CanvasPanState {
  canvasOffset: { x: number; y: number };
  isPanning: boolean;
  panStart: { x: number; y: number };
}

interface CanvasPanActions {
  setCanvasOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  handleCanvasPointerDown: (e: React.PointerEvent, setSelectedNodeId: (id: string | null) => void) => void;
  updatePanDelta: (deltaX: number, deltaY: number) => void;
  updatePanStart: (x: number, y: number) => void;
  endPan: () => void;
}

export const useCanvasPan = (): CanvasPanState & CanvasPanActions => {
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent, setSelectedNodeId: (id: string | null) => void) => {
    const target = e.target as HTMLElement;
    
    // 특정 요소들은 팬 시작하지 않음
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
    
    // 포인터 캡처
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const updatePanDelta = useCallback((deltaX: number, deltaY: number) => {
    setCanvasOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));
  }, []);

  const updatePanStart = useCallback((x: number, y: number) => {
    setPanStart({ x, y });
  }, []);

  const endPan = useCallback(() => {
    setIsPanning(false);
    setPanStart({ x: 0, y: 0 });
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  return {
    canvasOffset,
    isPanning,
    panStart,
    setCanvasOffset,
    handleCanvasPointerDown,
    updatePanDelta,
    updatePanStart,
    endPan,
  };
};
