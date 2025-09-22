import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import React from 'react';
import { BoxData, BoxMethods } from '../../box/types';
import { Container3D, Container3DData } from '@/features/3d-container/api/containerApi';

interface ContainerState {
  // 🎯 Container Data
  currentContainer: Container3DData | null;
  isContainerLoading: boolean;
  containerError: string | null;
  
  // 🎯 Boxes within Container
  boxes: Map<string, BoxData>;
  selectedBoxId: string | null;
  
  // 🎯 Getters
  getBox: (boxId: string) => BoxData | undefined;
  getAllBoxes: () => BoxData[];
  getAllBoxIds: () => string[];
  getBoxRef: (boxId: string) => React.RefObject<BoxMethods> | undefined;
  
  // 🎯 Container Management
  setCurrentContainer: (container: Container3DData | null) => void;
  setContainerLoading: (loading: boolean) => void;
  setContainerError: (error: string | null) => void;
  clearContainer: () => void;
  
  // 🎯 Box Management within Container
  addBox: (box: BoxData) => void;
  removeBox: (boxId: string) => void;
  updateBoxPosition: (boxId: string, x: number, y: number, z: number) => void;
  updateBoxDimensions: (boxId: string, lenX: number, lenY: number, lenZ: number) => void;
  updateBoxRotation: (boxId: string, rotX: number, rotY: number, rotZ: number) => void;
  updateBox: (boxId: string, x: number, y: number, z: number, lenX: number, lenY: number, lenZ: number) => void;
  clearAllBoxes: () => void;
  replaceAllBoxes: (boxes: BoxData[]) => void;
  
  // 🎯 Selection Management
  setSelectedBoxId: (id: string | null) => void;
  isBoxSelected: (boxId: string) => boolean;
  clearSelection: () => void;
  
  // 🎯 Computed State
  getContainerState: () => { 
    isLoading: boolean; 
    error: string | null; 
    isReady: boolean; 
    containerId: string | null;
    containerName: string | null;
    boxCount: number;
  };
}

/**
 * 컨테이너 상태 관리 스토어
 * 컨테이너와 그 안의 박스들을 함께 관리
 */
export const useContainerStore = create<ContainerState>()(
  subscribeWithSelector((set, get) => ({
    // 🎯 Initial State
    currentContainer: null,
    isContainerLoading: false,
    containerError: null,
    boxes: new Map(),
    selectedBoxId: null,
    
    // 🎯 Getters
    getBox: (boxId) => get().boxes.get(boxId),
    getAllBoxes: () => Array.from(get().boxes.values()),
    getAllBoxIds: () => Array.from(get().boxes.keys()),
    getBoxRef: (boxId) => get().boxes.get(boxId)?.ref,
    
    // 🎯 Container Management
    setCurrentContainer: (container) => set({ 
      currentContainer: container,
      containerError: null // 에러 초기화
    }),
    
    setContainerLoading: (loading) => set({ isContainerLoading: loading }),
    
    setContainerError: (error) => set({ containerError: error }),
    
    clearContainer: () => set({ 
      currentContainer: null,
      boxes: new Map(),
      selectedBoxId: null,
      isContainerLoading: false,
      containerError: null
    }),
    
    // 🎯 Box Management within Container
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
    
    updateBoxRotation: (boxId, rotX, rotY, rotZ) => set((state) => {
      const box = state.boxes.get(boxId);
      if (!box) return state;
      
      const newBoxes = new Map(state.boxes);
      newBoxes.set(boxId, { ...box, rotX, rotY, rotZ });
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
    
    // 🎯 Selection Management
    setSelectedBoxId: (id) => set({ selectedBoxId: id }),
    isBoxSelected: (boxId) => get().selectedBoxId === boxId,
    clearSelection: () => set({ selectedBoxId: null }),
    
    // 🎯 Computed State
    getContainerState: () => {
      const state = get();
      return {
        isLoading: state.isContainerLoading,
        error: state.containerError,
        isReady: !state.isContainerLoading && !!state.currentContainer && state.boxes.size > 0,
        containerId: state.currentContainer?.id || null,
        containerName: state.currentContainer?.name || null,
        boxCount: state.boxes.size
      };
    },
  }))
);

// 🎯 스토어 외부에서 사용할 수 있는 액션들
export const containerActions = {
  // 컨테이너 로드 완료시 호출
  loadContainerData: (container: Container3D, boxes: BoxData[]) => {
    const store = useContainerStore.getState();
    store.setCurrentContainer(container as Container3DData);
    store.replaceAllBoxes(boxes);
    store.setContainerLoading(false);
    store.setContainerError(null);
  },
  
  // 박스 이동
  moveBox: (boxId: string, x: number, y: number, z: number) => {
    useContainerStore.getState().updateBoxPosition(boxId, x, y, z);
  },
  
  // 박스 선택
  selectBox: (boxId: string | null) => {
    useContainerStore.getState().setSelectedBoxId(boxId);
  },
  
  // 새 박스 추가
  addNewBox: (box: BoxData) => {
    useContainerStore.getState().addBox(box);
  },
  
  // 컨테이너 로딩 시작
  startLoading: () => {
    const store = useContainerStore.getState();
    store.setContainerLoading(true);
    store.setContainerError(null);
  },
  
  // 컨테이너 로딩 실패
  setLoadingError: (error: string) => {
    const store = useContainerStore.getState();
    store.setContainerLoading(false);
    store.setContainerError(error);
  }
};
