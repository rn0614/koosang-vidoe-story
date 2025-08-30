// hooks/useConnectionDrag.ts
import { useState, useCallback } from 'react';
import type { ConnectionState } from '../types';

interface ConnectionDragActions {
  connectionState: ConnectionState;
  handleConnectionStart: (nodeId: string, e: React.MouseEvent) => void;
  updateConnectionLine: (x: number, y: number) => void;
  handleConnectionEnd: (
    e: React.PointerEvent, 
    addConnection: (from: string, to: string) => void
  ) => void;
  endConnection: () => void;
}

export const useConnectionDrag = (): ConnectionDragActions => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    startNodeId: null,
    tempLine: null,
  });

  const handleConnectionStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectionState({
      isConnecting: true,
      startNodeId: nodeId,
      tempLine: null,
    });
  }, []);

  const updateConnectionLine = useCallback((x: number, y: number) => {
    setConnectionState(prev => ({
      ...prev,
      tempLine: { x, y },
    }));
  }, []);

  const handleConnectionEnd = useCallback((
    e: React.PointerEvent, 
    addConnection?: (from: string, to: string) => void
  ) => {
    if (!connectionState.isConnecting || !connectionState.startNodeId) return;

    const target = e.target as HTMLElement;
    const connectionPoint = target.closest('.connection-point') as HTMLElement;
    
    if (
      connectionPoint &&
      connectionPoint.dataset.type === 'input' &&
      connectionPoint.dataset.nodeId !== connectionState.startNodeId &&
      addConnection
    ) {
      const targetNodeId = connectionPoint.dataset.nodeId!;
      addConnection(connectionState.startNodeId, targetNodeId);
    }
  }, [connectionState]);

  const endConnection = useCallback(() => {
    setConnectionState({
      isConnecting: false,
      startNodeId: null,
      tempLine: null,
    });
  }, []);

  return {
    connectionState,
    handleConnectionStart,
    updateConnectionLine,
    handleConnectionEnd,
    endConnection,
  };
};

