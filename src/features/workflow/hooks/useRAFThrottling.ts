// hooks/useRAFThrottling.ts
import { useRef, useCallback, useEffect } from 'react';

interface RAFThrottlingActions {
  scheduleUpdate: () => void;
  scheduleNodeUpdate: (nodeId: string, x: number, y: number, updateNode: (id: string, data: any) => void) => void;
  schedulePanUpdate: (deltaX: number, deltaY: number, updatePanDelta: (dx: number, dy: number) => void) => void;
}

export const useRAFThrottling = (): RAFThrottlingActions => {
  const rafRef = useRef<number | null>(null);
  const pendingDrag = useRef<{ nodeId: string; x: number; y: number; updateFn: (id: string, data: any) => void } | null>(null);
  const pendingPan = useRef<{ deltaX: number; deltaY: number; updateFn: (dx: number, dy: number) => void } | null>(null);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      
      // 드래그 업데이트 처리
      if (pendingDrag.current) {
        const { nodeId, x, y, updateFn } = pendingDrag.current;
        updateFn(nodeId, { x, y });
        pendingDrag.current = null;
      }
      
      // 팬 업데이트 처리
      if (pendingPan.current) {
        const { deltaX, deltaY, updateFn } = pendingPan.current;
        updateFn(deltaX, deltaY);
        pendingPan.current = null;
      }
    });
  }, []);

  const scheduleNodeUpdate = useCallback((
    nodeId: string, 
    x: number, 
    y: number, 
    updateNode: (id: string, data: any) => void
  ) => {
    pendingDrag.current = { nodeId, x, y, updateFn: updateNode };
    scheduleUpdate();
  }, [scheduleUpdate]);

  const schedulePanUpdate = useCallback((
    deltaX: number, 
    deltaY: number, 
    updatePanDelta: (dx: number, dy: number) => void
  ) => {
    pendingPan.current = { deltaX, deltaY, updateFn: updatePanDelta };
    scheduleUpdate();
  }, [scheduleUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return {
    scheduleUpdate,
    scheduleNodeUpdate,
    schedulePanUpdate,
  };
};

