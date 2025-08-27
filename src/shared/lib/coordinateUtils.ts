// utils/coordinateUtils.ts

export interface ConnectionCoords {
  from: { id: string; x: number; y: number };
  to: { id: string; x: number; y: number };
}

/**
 * 연결선 좌표 계산
 */
export const getConnectionCoordinates = (
  fromId: string,
  toId: string,
  coordinateCache: Map<string, { x: number; y: number }>,
  canvasOffset: { x: number; y: number }
): ConnectionCoords | null => {
  const fromCoords = coordinateCache.get(fromId);
  const toCoords = coordinateCache.get(toId);
  if (!fromCoords || !toCoords) return null;
  
  return {
    from: {
      id: fromId,
      x: fromCoords.x + 200 + canvasOffset.x, // 출력 포인트 위치
      y: fromCoords.y + 75 + canvasOffset.y,
    },
    to: {
      id: toId,
      x: toCoords.x - 8 + canvasOffset.x, // 입력 포인트 위치
      y: toCoords.y + 75 + canvasOffset.y,
    },
  };
};

/**
 * 임시 연결선 시작점 좌표 계산
 */
export const getTempConnectionStartCoords = (
  nodeId: string,
  coordinateCache: Map<string, { x: number; y: number }>,
  canvasOffset: { x: number; y: number }
): { x: number; y: number } | null => {
  const coords = coordinateCache.get(nodeId);
  if (!coords) return null;
  
  return {
    x: coords.x + 200 + 8 + canvasOffset.x,
    y: coords.y + 150 / 2 + canvasOffset.y,
  };
};

/**
 * 포인터 위치를 캔버스 상대 좌표로 변환
 */
export const getCanvasRelativePosition = (
  clientX: number,
  clientY: number,
  containerRect: DOMRect
): { x: number; y: number } => {
  return {
    x: clientX - containerRect.left,
    y: clientY - containerRect.top,
  };
};

/**
 * 노드 드래그 시 새 위치 계산
 */
export const calculateDragPosition = (
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  dragOffset: { x: number; y: number },
  canvasOffset: { x: number; y: number }
): { x: number; y: number } => {
  return {
    x: clientX - containerRect.left - dragOffset.x - canvasOffset.x,
    y: clientY - containerRect.top - dragOffset.y - canvasOffset.y,
  };
};

