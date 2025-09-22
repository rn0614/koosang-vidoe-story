import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import React from 'react';
import { BoxData, BoxMethods, StabilityInfo } from '../types';
import { BoxPhysics } from './physics';

interface BoxesState {
  // 🎯 State
  boxes: Map<string, BoxData>;
  selectedBoxId: string | null;
  
  // 🎯 Container State
  currentContainerId: string | null;
  currentContainerName: string | null;
  isContainerLoading: boolean;
  containerError: string | null;
  
  // 🎯 Getters
  getBox: (boxId: string) => BoxData | undefined;
  getAllBoxes: () => BoxData[];
  getAllBoxIds: () => string[];
  getBoxRef: (boxId: string) => React.RefObject<BoxMethods> | undefined;
  
  // 🎯 Box Management
  addBox: (box: BoxData) => void;
  removeBox: (boxId: string) => void;
  updateBoxPosition: (boxId: string, x: number, y: number, z: number) => void;
  updateBoxDimensions: (boxId: string, lenX: number, lenY: number, lenZ: number) => void;
  updateBox: (boxId: string, x: number, y: number, z: number, lenX: number, lenY: number, lenZ: number) => void;
  clearAllBoxes: () => void;
  replaceAllBoxes: (boxes: BoxData[]) => void;
  
  // 🎯 Container Management
  setCurrentContainer: (containerId: string | null, containerName?: string | null) => void;
  getCurrentContainer: () => { id: string | null; name: string | null };
  clearCurrentContainer: () => void;
  
  // 🎯 Container Loading State
  setContainerLoading: (loading: boolean) => void;
  setContainerError: (error: string | null) => void;
  getContainerState: () => { 
    isLoading: boolean; 
    error: string | null; 
    isReady: boolean; 
  };
  
  // 🎯 Selection Management
  setSelectedBoxId: (id: string | null) => void;
  isBoxSelected: (boxId: string) => boolean;
  clearSelection: () => void;
  
  // 🎯 Physics & Validation
  isPositionAvailable: (x: number, y: number, z: number, lenX: number, lenY: number, lenZ: number, excludeBoxId?: string) => boolean;
  findNearestAvailablePosition: (
    targetX: number,
    targetY: number,
    targetZ: number,
    lenX: number,
    lenY: number,
    lenZ: number,
    excludeBoxId?: string
  ) => { x: number; y: number; z: number };
  checkBoxStability: (x: number, y: number, z: number, lenX: number, lenY: number, lenZ: number, excludeBoxId?: string) => StabilityInfo;
  findMinimumYPosition: (x: number, z: number, lenX: number, lenY: number, lenZ: number, excludeBoxId?: string) => number;
  
  // 🎯 Optimized Selectors
  selectBoxData: (boxId: string) => (state: BoxesState) => BoxData | undefined;
  selectBoxPosition: (boxId: string) => (state: BoxesState) => { x: number; y: number; z: number } | undefined;
  selectBoxDimensions: (boxId: string) => (state: BoxesState) => { lenX: number; lenY: number; lenZ: number } | undefined;
  selectBoxProperties: (boxId: string) => (state: BoxesState) => { 
    lenX: number; 
    lenY: number; 
    lenZ: number; 
    color: string; 
    id: string 
  } | undefined;
}

/**
 * 초기 박스 데이터 생성
 */
const createInitialBoxes = (): Map<string, BoxData> => {
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

/**
 * 박스 상태 관리 스토어
 * subscribeWithSelector를 사용하여 선택적 구독 최적화
 */
export const useBoxStore = create<BoxesState>()(
  subscribeWithSelector((set, get) => ({
    // 🎯 Initial State
    boxes: createInitialBoxes(),
    selectedBoxId: null,
    
    // 🎯 Container State
    currentContainerId: null,
    currentContainerName: null,
    isContainerLoading: false,
    containerError: null,
    
    // 🎯 Getters
    getBox: (boxId) => get().boxes.get(boxId),
    getAllBoxes: () => Array.from(get().boxes.values()),
    getAllBoxIds: () => Array.from(get().boxes.keys()),
    getBoxRef: (boxId) => get().boxes.get(boxId)?.ref,
    
    // 🎯 Box Management
    addBox: (box) => set((state) => {
      const newBoxes = new Map(state.boxes);
      newBoxes.set(box.id, box);
      return { boxes: newBoxes };
    }),
    
    removeBox: (boxId) => set((state) => {
      const newBoxes = new Map(state.boxes);
      newBoxes.delete(boxId);
      return { 
        boxes: newBoxes,
        selectedBoxId: state.selectedBoxId === boxId ? null : state.selectedBoxId
      };
    }),
    
    updateBoxPosition: (boxId, x, y, z) => set((state) => {
      const box = state.boxes.get(boxId);
      if (!box) return state;
      
      // 실제로 위치가 변경된 경우에만 업데이트
      if (box.x === x && box.y === y && box.z === z) {
        return state;
      }
      
      const newBoxes = new Map(state.boxes);
      newBoxes.set(boxId, { ...box, x, y, z });
      return { boxes: newBoxes };
    }),
    
    updateBoxDimensions: (boxId, lenX, lenY, lenZ) => set((state) => {
      const box = state.boxes.get(boxId);
      if (!box) return state;
      
      const newBoxes = new Map(state.boxes);
      newBoxes.set(boxId, { ...box, lenX, lenY, lenZ });
      return { boxes: newBoxes };
    }),
    
    updateBox: (boxId, x, y, z, lenX, lenY, lenZ) => set((state) => {
      const box = state.boxes.get(boxId);
      if (!box) return state;
      
      const newBoxes = new Map(state.boxes);
      newBoxes.set(boxId, { ...box, x, y, z, lenX, lenY, lenZ });
      return { boxes: newBoxes };
    }),
    
    clearAllBoxes: () => set({ 
      boxes: new Map(),
      selectedBoxId: null 
    }),
    
    replaceAllBoxes: (boxes) => set(() => {
      const newBoxes = new Map<string, BoxData>();
      boxes.forEach(box => {
        // ref가 없는 경우 새로 생성
        const boxWithRef = box.ref ? box : { ...box, ref: React.createRef<BoxMethods>() };
        newBoxes.set(box.id, boxWithRef);
      });
      return { 
        boxes: newBoxes,
        selectedBoxId: null 
      };
    }),
    
    // 🎯 Container Management
    setCurrentContainer: (containerId, containerName = null) => set({ 
      currentContainerId: containerId,
      currentContainerName: containerName 
    }),
    
    getCurrentContainer: () => ({
      id: get().currentContainerId,
      name: get().currentContainerName
    }),
    
    clearCurrentContainer: () => set({ 
      currentContainerId: null,
      currentContainerName: null,
      boxes: new Map(),
      selectedBoxId: null,
      isContainerLoading: false,
      containerError: null
    }),
    
    // 🎯 Container Loading State Management
    setContainerLoading: (loading) => set({ isContainerLoading: loading }),
    setContainerError: (error) => set({ containerError: error }),
    getContainerState: () => ({
      isLoading: get().isContainerLoading,
      error: get().containerError,
      isReady: !get().isContainerLoading && !!get().currentContainerId && get().boxes.size > 0
    }),
    
    // 🎯 Selection Management
    setSelectedBoxId: (id) => set({ selectedBoxId: id }),
    isBoxSelected: (boxId) => get().selectedBoxId === boxId,
    clearSelection: () => set({ selectedBoxId: null }),
    
    // 🎯 Physics & Validation (위임)
    isPositionAvailable: (x, y, z, lenX, lenY, lenZ, excludeBoxId) => {
      return BoxPhysics.isPositionAvailable(x, y, z, lenX, lenY, lenZ, get().boxes, excludeBoxId);
    },
    
    findNearestAvailablePosition: (targetX, targetY, targetZ, lenX, lenY, lenZ, excludeBoxId) => {
      return BoxPhysics.findNearestAvailablePosition(targetX, targetY, targetZ, lenX, lenY, lenZ, get().boxes, excludeBoxId);
    },
    
    checkBoxStability: (x, y, z, lenX, lenY, lenZ, excludeBoxId) => {
      return BoxPhysics.checkBoxStability(x, y, z, lenX, lenY, lenZ, get().boxes, excludeBoxId);
    },
    
    findMinimumYPosition: (x, z, lenX, lenY, lenZ, excludeBoxId) => {
      return BoxPhysics.findMinimumYPosition(x, z, lenX, lenY, lenZ, get().boxes, excludeBoxId);
    },
    
    // 🎯 Optimized Selectors
    selectBoxData: (boxId) => (state) => state.boxes.get(boxId),
    selectBoxPosition: (boxId) => (state) => {
      const box = state.boxes.get(boxId);
      return box ? { x: box.x, y: box.y, z: box.z } : undefined;
    },
    selectBoxDimensions: (boxId) => (state) => {
      const box = state.boxes.get(boxId);
      return box ? { lenX: box.lenX, lenY: box.lenY, lenZ: box.lenZ } : undefined;
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

// 🎯 스토어 외부에서 사용할 수 있는 액션들
export const boxActions = {
  moveBox: (boxId: string, x: number, y: number, z: number) => {
    useBoxStore.getState().updateBoxPosition(boxId, x, y, z);
  },
  
  selectBox: (boxId: string | null) => {
    useBoxStore.getState().setSelectedBoxId(boxId);
  },
  
  addNewBox: (box: BoxData) => {
    useBoxStore.getState().addBox(box);
  }
};
