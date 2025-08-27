// hooks/useVirtualRendering.ts
import { useMemo } from 'react';
import type { WorkflowConnection } from '@/shared/types/workflow';

interface VirtualRenderingResult {
  coordinateCache: Map<string, { x: number; y: number }>;
  viewportBounds: { left: number; top: number; right: number; bottom: number };
  visibleNodeIds: string[];
  visibleConnections: WorkflowConnection[];
}

interface UseVirtualRenderingProps {
  nodeIds: string[];
  connections: WorkflowConnection[];
  getNode: (nodeId: string) => any;
  canvasOffset: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useVirtualRendering = ({
  nodeIds,
  connections,
  getNode,
  canvasOffset,
  containerRef,
}: UseVirtualRenderingProps): VirtualRenderingResult => {
  // 좌표 캐시 시스템
  const coordinateCache = useMemo(() => {
    const cache = new Map<string, { x: number; y: number }>();
    nodeIds.forEach(nodeId => {
      const node = getNode(nodeId);
      if (node) {
        cache.set(nodeId, { x: node.x, y: node.y });
      }
    });
    return cache;
  }, [nodeIds, getNode, canvasOffset]);

  // 가시 영역 계산
  const viewportBounds = useMemo(() => {
    if (!containerRef.current) {
      return { left: -canvasOffset.x, top: -canvasOffset.y, right: 2000, bottom: 1500 };
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const padding = 300; // 여유분
    
    return {
      left: -canvasOffset.x - padding,
      top: -canvasOffset.y - padding,
      right: -canvasOffset.x + rect.width + padding,
      bottom: -canvasOffset.y + rect.height + padding,
    };
  }, [canvasOffset, containerRef]);

  // 가시 영역 내 노드 필터링
  const visibleNodeIds = useMemo(() => {
    const NODE_WIDTH = 200;
    const NODE_HEIGHT = 150;
    
    return nodeIds.filter(nodeId => {
      const coords = coordinateCache.get(nodeId);
      if (!coords) return false;
      
      const nodeLeft = coords.x;
      const nodeTop = coords.y;
      const nodeRight = coords.x + NODE_WIDTH;
      const nodeBottom = coords.y + NODE_HEIGHT;
      
      return !(
        nodeRight < viewportBounds.left ||
        nodeLeft > viewportBounds.right ||
        nodeBottom < viewportBounds.top ||
        nodeTop > viewportBounds.bottom
      );
    });
  }, [nodeIds, coordinateCache, viewportBounds]);

  // 가시 영역 내 연결선 필터링
  const visibleConnections = useMemo(() => {
    const visibleNodeSet = new Set(visibleNodeIds);
    return connections.filter(conn => 
      visibleNodeSet.has(conn.from) || visibleNodeSet.has(conn.to)
    );
  }, [connections, visibleNodeIds]);

  return {
    coordinateCache,
    viewportBounds,
    visibleNodeIds,
    visibleConnections,
  };
};

