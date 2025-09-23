import { useState, useCallback, useEffect } from 'react';
import { containerApi, type Container3D, type Container3DData } from '../api/containerApi';
import { useBoxStore } from '@/entities/box';
import type { BoxData } from '@/entities/box';

/**
 * 3D 컨테이너 관리를 위한 커스텀 훅
 * templateApi.ts와 useTemplateManager.ts 패턴을 참고하여 구현
 */
export const useContainerManager = () => {
  // ==========================================
  // 상태 관리
  // ==========================================
  const [containers, setContainers] = useState<Container3D[]>([]);
  const [currentContainer, setCurrentContainer] = useState<Container3D | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // 컨테이너 관리
  // ==========================================

  // 컨테이너 목록 새로고침
  const refreshContainers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedContainers = await containerApi.getContainersList();
      setContainers(fetchedContainers);
      console.log(`✅ 컨테이너 목록 로드 완료: ${fetchedContainers.length}개`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '컨테이너 목록을 불러오는데 실패했습니다.';
      setError(errorMsg);
      console.error('❌ 컨테이너 목록 로드 실패:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 컨테이너 목록 로드
  useEffect(() => {
    refreshContainers();
  }, [refreshContainers]);

  // 컨테이너 생성
  const createContainer = useCallback(async (
    name: string, 
    description?: string,
    dimensions: { width: number; height: number; depth: number } = { width: 50, height: 30, depth: 40 }
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newContainer = await containerApi.createContainer({
        name,
        description,
        width: dimensions.width,
        height: dimensions.height,
        depth: dimensions.depth,
        settings: {},
        is_active: true
      });
      
      await refreshContainers(); // 목록 갱신
      console.log(`✅ 컨테이너 생성 완료: ${newContainer.name}`);
      return newContainer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '컨테이너 생성에 실패했습니다.';
      setError(errorMsg);
      console.error('❌ 컨테이너 생성 실패:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshContainers]);

  // 컨테이너 업데이트
  const updateContainer = useCallback(async (
    containerId: string,
    updates: Partial<Pick<Container3DData, 'name' | 'description' | 'width' | 'height' | 'depth' | 'settings'>>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedContainer = await containerApi.updateContainer(containerId, updates);
      
      // 현재 컨테이너가 업데이트된 경우 상태 갱신
      if (currentContainer?.id === containerId) {
        setCurrentContainer(updatedContainer);
      }
      
      await refreshContainers(); // 목록 갱신
      console.log(`✅ 컨테이너 업데이트 완료: ${updatedContainer.name}`);
      return updatedContainer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '컨테이너 업데이트에 실패했습니다.';
      setError(errorMsg);
      console.error('❌ 컨테이너 업데이트 실패:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentContainer, refreshContainers]);

  // 컨테이너 삭제
  const deleteContainer = useCallback(async (containerId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await containerApi.deleteContainer(containerId);
      
      // 현재 컨테이너가 삭제된 경우 초기화
      if (currentContainer?.id === containerId) {
        setCurrentContainer(null);
        // Box Store도 초기화 (getState() 사용으로 순환 의존성 방지)
        useBoxStore.getState().clearAllBoxes();
        useBoxStore.getState().clearCurrentContainer();
      }
      
      await refreshContainers(); // 목록 갱신
      console.log(`✅ 컨테이너 삭제 완료: ${containerId}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '컨테이너 삭제에 실패했습니다.';
      setError(errorMsg);
      console.error('❌ 컨테이너 삭제 실패:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentContainer]); // 🎯 boxStore 의존성 제거

  // ==========================================
  // 컨테이너 선택 및 박스 로드
  // ==========================================

  // 컨테이너 ID로 직접 로드 (리스트 없이)
  const loadContainerById = useCallback(async (containerId: string) => {
    const boxStore = useBoxStore.getState();
    
    // 중복 로딩 방지
    if (boxStore.isContainerLoading) {
      console.log('⏳ 이미 로딩 중이므로 스킵');
      return;
    }
    
    // Box Store에서 로딩 상태 관리
    boxStore.setContainerLoading(true);
    boxStore.setContainerError(null);
    
    try {
      // 1. 컨테이너 상세 정보와 박스 데이터를 병렬로 로드
      const [containerDetail, boxes] = await Promise.all([
        containerApi.getContainer(containerId),
        containerApi.getContainerBoxes(containerId)
      ]);
      
      if (!containerDetail) {
        throw new Error('컨테이너를 찾을 수 없습니다.');
      }
      
      // 2. Box Store에 데이터 설정 (한 번에 업데이트)
      boxStore.setCurrentContainer(containerDetail.id, containerDetail.name);
      boxStore.replaceAllBoxes(boxes);
      
      // 3. 로컬 상태도 업데이트 (useContainerManager용)
      setCurrentContainer(containerDetail);
      
      console.log(`✅ 컨테이너 직접 로드 완료: ${containerDetail.name} (박스 ${boxes.length}개)`);
      return containerDetail;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '컨테이너를 불러오는데 실패했습니다.';
      boxStore.setContainerError(errorMsg);
      setError(errorMsg);
      console.error('❌ 컨테이너 직접 로드 실패:', errorMsg);
      throw err;
    } finally {
      boxStore.setContainerLoading(false);
    }
  }, []); // 의존성 완전 제거

  // 컨테이너 선택 및 박스 데이터 로드 (기존 - 리스트에서 선택할 때 사용)
  const loadContainer = useCallback(async (container: Container3DData) => {
    const boxStore = useBoxStore.getState();
    
    // 중복 로딩 방지
    if (boxStore.isContainerLoading) {
      console.log('⏳ 이미 로딩 중이므로 스킵');
      return;
    }
    
    // Box Store에서 로딩 상태 관리
    boxStore.setContainerLoading(true);
    boxStore.setContainerError(null);
    
    try {
      // 1. 컨테이너 상세 정보와 박스 데이터를 병렬로 로드
      const [containerDetail, boxes] = await Promise.all([
        containerApi.getContainer(container.id),
        containerApi.getContainerBoxes(container.id)
      ]);
      
      if (!containerDetail) {
        throw new Error('컨테이너를 찾을 수 없습니다.');
      }
      
      // 2. Box Store에 데이터 설정 (한 번에 업데이트)
      boxStore.setCurrentContainer(containerDetail.id, containerDetail.name);
      boxStore.replaceAllBoxes(boxes);
      
      // 3. 로컬 상태도 업데이트 (useContainerManager용)
      setCurrentContainer(containerDetail);
      
      console.log(`✅ 컨테이너 로드 완료: ${containerDetail.name} (박스 ${boxes.length}개)`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '컨테이너를 불러오는데 실패했습니다.';
      boxStore.setContainerError(errorMsg);
      setError(errorMsg);
      console.error('❌ 컨테이너 로드 실패:', errorMsg);
      throw err;
    } finally {
      boxStore.setContainerLoading(false);
    }
  }, []); // 의존성 완전 제거

  // ==========================================
  // 박스 데이터 동기화
  // ==========================================

  // 현재 박스 상태를 데이터베이스에 저장
  const saveCurrentBoxes = useCallback(async () => {
    if (!currentContainer) {
      throw new Error('저장할 컨테이너가 선택되지 않았습니다.');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const currentBoxes = useBoxStore.getState().getAllBoxes();
      await containerApi.syncContainerBoxes(currentContainer.id, currentBoxes);
      console.log(`✅ 박스 데이터 저장 완료: ${currentBoxes.length}개`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '박스 데이터 저장에 실패했습니다.';
      setError(errorMsg);
      console.error('❌ 박스 데이터 저장 실패:', errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentContainer]); // 🎯 boxStore 의존성 제거

  // 단일 박스 위치 업데이트
  const updateBoxPositionInDB = useCallback(async (boxId: string, x: number, y: number, z: number) => {
    if (!currentContainer) return;
    
    try {
      await containerApi.updateBoxPosition(currentContainer.id, boxId, x, y, z);
      console.log(`✅ 박스 위치 DB 업데이트: ${boxId} -> (${x}, ${y}, ${z})`);
    } catch (err) {
      console.error(`❌ 박스 위치 DB 업데이트 실패: ${boxId}`, err);
      // DB 업데이트 실패는 에러 상태로 설정하지 않음 (UX 고려)
    }
  }, [currentContainer]);

  // 단일 박스 크기 업데이트
  const updateBoxDimensionsInDB = useCallback(async (boxId: string, sizeX: number, sizeY: number, sizeZ: number) => {
    if (!currentContainer) return;
    
    try {
      await containerApi.updateBoxDimensions(currentContainer.id, boxId, sizeX, sizeY, sizeZ);
      console.log(`✅ 박스 크기 DB 업데이트: ${boxId} -> (${sizeX}, ${sizeY}, ${sizeZ})`);
    } catch (err) {
      console.error(`❌ 박스 크기 DB 업데이트 실패: ${boxId}`, err);
    }
  }, [currentContainer]);

  // 박스 생성시 DB에도 추가
  const addBoxToDB = useCallback(async (boxData: BoxData) => {
    if (!currentContainer) return;
    
    try {
      await containerApi.createBox(boxData, currentContainer.id);
      console.log(`✅ 박스 DB 추가: ${boxData.id}`);
    } catch (err) {
      console.error(`❌ 박스 DB 추가 실패: ${boxData.id}`, err);
    }
  }, [currentContainer]);

  // 박스 삭제시 DB에서도 제거
  const removeBoxFromDB = useCallback(async (boxId: string) => {
    if (!currentContainer) return;
    
    try {
      await containerApi.deleteBox(currentContainer.id, boxId);
      console.log(`✅ 박스 DB 삭제: ${boxId}`);
    } catch (err) {
      console.error(`❌ 박스 DB 삭제 실패: ${boxId}`, err);
    }
  }, [currentContainer]);

  // ==========================================
  // 자동 동기화 옵션
  // ==========================================

  // 자동 저장 활성화 (박스 변경시 자동으로 DB 업데이트)
  const enableAutoSync = useCallback(() => {
    // TODO: Box Store에 리스너 추가하여 변경사항 자동 감지 및 DB 동기화
    console.log('🔄 자동 동기화 활성화 (구현 예정)');
  }, []);

  // ==========================================
  // Return
  // ==========================================

  return {
    // 상태
    containers,
    currentContainer,
    isLoading,
    error,
    
    // 컨테이너 관리
    refreshContainers,
    createContainer,
    updateContainer,
    deleteContainer,
    loadContainer,
    loadContainerById,
    
    // 박스 데이터 동기화
    saveCurrentBoxes,
    updateBoxPositionInDB,
    updateBoxDimensionsInDB,
    addBoxToDB,
    removeBoxFromDB,
    
    // 유틸리티
    enableAutoSync,
    
    // 편의 메서드
    hasCurrentContainer: !!currentContainer,
    currentContainerName: currentContainer?.name || '',
    currentContainerDimensions: currentContainer ? {
      width: currentContainer.width,
      height: currentContainer.height,
      depth: currentContainer.depth
    } : null
  };
};
