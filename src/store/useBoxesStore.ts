import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import React from 'react';
import { BoxData, BoxMethods } from '@/types/boxPosition';

interface BoxesState {
  boxes: Map<string, BoxData>;
  selectedBoxId: string | null;
  
  // 🎯 개별 박스 접근용 메서드들
  getBox: (boxId: string) => BoxData | undefined;
  getAllBoxIds: () => string[];
  
  // 🎯 박스 조작 메서드들
  addBox: (box: BoxData) => void;
  moveBox: (boxId: string, x: number, y: number, z: number) => void;
  updateBox: (boxId: string, x: number, y: number, z: number, lenX: number, lenY: number, lenZ: number) => void;
  
  // 🎯 박스 참조 관리
  getBoxRef: (boxId: string) => React.RefObject<BoxMethods> | undefined;
  
  // 🎯 물리/충돌 검사
  findNearestAvailablePosition: (
    targetX: number,
    targetY: number,
    targetZ: number,
    lenX: number,
    lenY: number,
    lenZ: number,
    excludeBoxId?: string
  ) => { x: number; y: number; z: number };
  isPositionAvailable: (x: number, y: number, z: number, lenX: number, lenY: number, lenZ: number, excludeBoxId?: string) => boolean;
  checkBoxStability: (x: number, y: number, z: number, lenX: number, lenY: number, lenZ: number, excludeBoxId?: string) => {
    isStable: boolean;
    reason: string;
    supportingBoxes: { id: string; centerSupported: boolean }[];
    centerX: number;
    centerZ: number;
    centerSupported: boolean;
  };
  findMinimumYPosition: (x: number, z: number, lenX: number, lenY: number, lenZ: number, excludeBoxId?: string) => number;
  
  // 🎯 선택 상태 관리
  setSelectedBoxId: (id: string | null) => void;
  isBoxSelected: (boxId: string) => boolean;
  
  // 🚀 새로 추가: 개별 박스 데이터 선택자
  selectBoxData: (boxId: string) => (state: BoxesState) => BoxData | undefined;
  selectBoxPosition: (boxId: string) => (state: BoxesState) => { x: number; y: number; z: number } | undefined;
  selectBoxProperties: (boxId: string) => (state: BoxesState) => { lenX: number; lenY: number; lenZ: number; color: string; id: string } | undefined;
}

const initialBoxes = () => {
  const initial = new Map<string, BoxData>();
  const boxConfigs = [
    { id: 'BOX-001', x: 2, y: 2, z: 2, color: '#4299e1' },
    { id: 'BOX-002', x: 4, y: 2, z: 2, color: '#48bb78' },
    { id: 'BOX-003', x: 6, y: 2, z: 2, color: '#ed8936' },
    { id: 'BOX-004', x: 2, y: 2, z: 4, color: '#9f7aea' },
    { id: 'BOX-005', x: 4, y: 2, z: 4, color: '#f56565' },
    { id: 'BOX-006', x: 6, y: 2, z: 4, color: '#38b2ac' },
    { id: 'BOX-007', x: 2, y: 2, z: 6, color: '#d69e2e' },
    { id: 'BOX-008', x: 4, y: 2, z: 6, color: '#e53e3e' },
    { id: 'BOX-009', x: 6, y: 2, z: 6, color: '#805ad5' },
  ];
  
  boxConfigs.forEach(({ id, x, y, z, color }) => {
    initial.set(id, {
      id,
      x,
      y,
      z,
      lenX: 2,
      lenY: 2,
      lenZ: 2,
      color,
      ref: React.createRef<BoxMethods>()
    });
  });
  
  return initial;
};

// 🚀 subscribeWithSelector 미들웨어 사용으로 선택적 구독 최적화
export const useBoxesStore = create<BoxesState>()(
  subscribeWithSelector((set, get) => ({
    boxes: initialBoxes(),
    selectedBoxId: null,
    
    getBox: (boxId) => get().boxes.get(boxId),
    getAllBoxIds: () => Array.from(get().boxes.keys()),
    
    addBox: (box) => set((state) => {
      const next = new Map(state.boxes);
      next.set(box.id, box);
      return { boxes: next };
    }),
    
    // 🎯 moveBox 최적화: 불변성 유지하면서 단일 박스만 업데이트
    moveBox: (boxId, x, y, z) => set((state) => {
      const boxes = state.boxes;
      const existingBox = boxes.get(boxId);
      
      if (!existingBox) return state;
      
      // 🚀 위치가 실제로 변경된 경우에만 업데이트
      if (existingBox.x === x && existingBox.y === y && existingBox.z === z) {
        return state;
      }
      
      const next = new Map(boxes);
      next.set(boxId, { ...existingBox, x, y, z });
      return { boxes: next };
    }),
    
    updateBox: (boxId, x, y, z, lenX, lenY, lenZ) => set((state) => {
      const next = new Map(state.boxes);
      const box = next.get(boxId);
      if (box) {
        next.set(boxId, { ...box, x, y, z, lenX, lenY, lenZ });
      }
      return { boxes: next };
    }),
    
    getBoxRef: (boxId) => get().boxes.get(boxId)?.ref,
    
    findNearestAvailablePosition: (targetX, targetY, targetZ, lenX, lenY, lenZ, excludeBoxId) => {
      return { x: targetX, y: targetY, z: targetZ };
    },
    
    isPositionAvailable: (x, y, z, lenX, lenY, lenZ, excludeBoxId) => {
      const testBox = { x, y, z, lenX, lenY, lenZ };
      const boxes = get().boxes;
      let available = true;
      
      boxes.forEach((existingBox, boxId) => {
        if (excludeBoxId && boxId === excludeBoxId) return;
        
        const bounds1 = {
          minX: testBox.x - testBox.lenX,
          maxX: testBox.x,
          minY: testBox.y - testBox.lenY,
          maxY: testBox.y,
          minZ: testBox.z - testBox.lenZ,
          maxZ: testBox.z
        };
        const bounds2 = {
          minX: existingBox.x - existingBox.lenX,
          maxX: existingBox.x,
          minY: existingBox.y - existingBox.lenY,
          maxY: existingBox.y,
          minZ: existingBox.z - existingBox.lenZ,
          maxZ: existingBox.z
        };
        
        if (
          bounds1.maxX > bounds2.minX && bounds1.minX < bounds2.maxX &&
          bounds1.maxY > bounds2.minY && bounds1.minY < bounds2.maxY &&
          bounds1.maxZ > bounds2.minZ && bounds1.minZ < bounds2.maxZ
        ) {
          available = false;
        }
      });
      
      return available;
    },
    
    checkBoxStability: (x, y, z, lenX, lenY, lenZ, excludeBoxId) => {
      const boxes = get().boxes;
      const centerX = x - lenX / 2;
      const centerZ = z - lenZ / 2;
      const bottomY = y - lenY;
      const supportingBoxes: { id: string; centerSupported: boolean }[] = [];
      let isCenterSupported = false;
      
      if (y - lenY <= 0) {
        return {
          isStable: true,
          reason: 'ground',
          supportingBoxes,
          centerX,
          centerZ,
          centerSupported: true
        };
      }
      
      boxes.forEach((existingBox, boxId) => {
        if (excludeBoxId && boxId === excludeBoxId) return;
        
        const bounds = {
          minX: existingBox.x - existingBox.lenX,
          maxX: existingBox.x,
          minY: existingBox.y - existingBox.lenY,
          maxY: existingBox.y,
          minZ: existingBox.z - existingBox.lenZ,
          maxZ: existingBox.z
        };
        
        if (Math.abs(bottomY - bounds.maxY) < 0.1) {
          const isXInside = centerX > bounds.minX && centerX < bounds.maxX;
          const isZInside = centerZ > bounds.minZ && centerZ < bounds.maxZ;
          
          if (isXInside && isZInside) {
            isCenterSupported = true;
            supportingBoxes.push({ id: boxId, centerSupported: true });
          } else {
            supportingBoxes.push({ id: boxId, centerSupported: false });
          }
        }
      });
      
      return {
        isStable: isCenterSupported,
        reason: isCenterSupported ? 'center_supported' : 'center_unsupported',
        supportingBoxes,
        centerX,
        centerZ,
        centerSupported: isCenterSupported
      };
    },
    
    findMinimumYPosition: (x, z, lenX, lenY, lenZ, excludeBoxId) => {
      const isPositionAvailable = get().isPositionAvailable;
      for (let testY = lenY; testY <= 50; testY++) {
        if (isPositionAvailable(x, testY, z, lenX, lenY, lenZ, excludeBoxId)) {
          return testY;
        }
      }
      return lenY;
    },
    
    setSelectedBoxId: (id) => set({ selectedBoxId: id }),
    isBoxSelected: (boxId) => get().selectedBoxId === boxId,
    
    // 🚀 개별 박스 선택자들 - 컴포넌트에서 사용
    selectBoxData: (boxId) => (state) => state.boxes.get(boxId),
    selectBoxPosition: (boxId) => (state) => {
      const box = state.boxes.get(boxId);
      return box ? { x: box.x, y: box.y, z: box.z } : undefined;
    },
    selectBoxProperties: (boxId) => (state) => {
      const box = state.boxes.get(boxId);
      return box ? { 
        lenX: box.lenX, 
        lenY: box.lenY, 
        lenZ: box.lenZ, 
        color: box.color, 
        id: box.id 
      } : undefined;
    },
  }))
);