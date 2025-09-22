import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useContainerStore } from '@/entities/container';
import { useContainerQuery } from './useContainerQuery';

interface Use3DContainerProps {
  containerId: string;
}

/**
 * 3D 컨테이너 메인 로직을 관리하는 훅
 * Zustand Store 중심으로 단순화
 */
export const use3DContainer = ({ containerId }: Use3DContainerProps) => {
  const router = useRouter();
  
  // TanStack Query로 데이터 관리
  const { 
    loadContainer, 
    saveBoxesAsync, 
    isLoading, 
    isError, 
    error 
  } = useContainerQuery(containerId);
  
  // Zustand Store에서 상태 구독 (개별적으로 구독하여 리렌더링 최적화)
  const currentContainerId = useContainerStore((state) => state.getContainerState().containerId);
  const isContainerLoading = useContainerStore((state) => state.isContainerLoading);
  const containerError = useContainerStore((state) => state.containerError);
  const containerName = useContainerStore((state) => state.getContainerState().containerName);
  const isReady = useContainerStore((state) => true);
  const boxCount = useContainerStore((state) => state.getContainerState().boxCount);

  // 🎯 컨테이너 로드
  useEffect(() => {
    if (!containerId) {
      console.log('❌ containerId가 없음');
      return;
    }

    // 이미 같은 컨테이너가 로드된 경우
    if (currentContainerId === containerId) {
      console.log('✅ 이미 로드된 컨테이너:', containerId);
      return;
    }

    // 이미 로딩 중인 경우
    if (isContainerLoading) {
      console.log('⏳ 컨테이너 로딩 중...');
      return;
    }

    // 컨테이너 로드 시작
    console.log(`📦 컨테이너 로드 시작: ${containerId}`);
    loadContainer(containerId);

  }, [containerId, currentContainerId, isContainerLoading, loadContainer]);

  // 박스 선택 핸들러
  const handleSelectBox = useCallback((boxId: string) => {
    console.log(`🎯 박스 선택: ${boxId}`);
    useContainerStore.getState().setSelectedBoxId(boxId);
  }, []);

  // 컨베이어로 이동
  const handleMoveToConveyor = useCallback((boxId: string): void => {
    const ref = useContainerStore.getState().getBoxRef(boxId);
    if (ref && ref.current) {
      console.log(`⬆️ ${boxId} 컨베이어로 이동`);
      ref.current.moveToConveyor();
    }
  }, []);

  // 바닥으로 드롭
  const handleDropToBottom = useCallback((boxId: string): void => {
    const ref = useContainerStore.getState().getBoxRef(boxId);
    if (ref && ref.current) {
      console.log(`⬇️ ${boxId} 바닥으로 이동`);
      ref.current.dropToBottom();
    }
  }, []);

  // 다른 위치로 이동
  const handleMoveToOtherPosition = useCallback(
    async (boxId: string, x: number, z: number): Promise<void> => {
      const ref = useContainerStore.getState().getBoxRef(boxId);
      if (ref && ref.current) {
        try {
          console.log(`🚚 ${boxId} 시퀀셜 이동 시작: (${x}, ${z})`);
          await ref.current.moveToOtherPosition(x, z);
          console.log(`✅ ${boxId} 시퀀셜 이동 완료`);
        } catch (error) {
          console.error(`❌ ${boxId} 이동 실패:`, error);
        }
      }
    },
    [],
  );

  // 데이터베이스 저장
  const handleSaveToDatabase = useCallback(async () => {
    if (!currentContainerId) {
      alert('컨테이너가 선택되지 않았습니다.');
      return;
    }
    
    try {
      const currentBoxes = useContainerStore.getState().getAllBoxes();
      await saveBoxesAsync({ 
        containerId: currentContainerId, 
        boxes: currentBoxes 
      });
      alert('✅ 박스 데이터가 성공적으로 저장되었습니다!');
    } catch (error) {
      console.error('데이터베이스 저장 실패:', error);
      alert('❌ 저장에 실패했습니다.');
    }
  }, [currentContainerId, saveBoxesAsync]);

  // 컨테이너 목록으로 돌아가기
  const handleBackToList = useCallback(() => {
    router.push('/3d/container');
  }, [router]);

  return {
    // State (개별 상태 구독으로 최적화)
    currentContainerId,
    containerName,
    isLoading: isLoading || isContainerLoading,
    isDataReady: isReady,
    error: containerError || (isError && error instanceof Error ? error.message : null),
    boxCount,

    // Handlers
    handleSelectBox,
    handleMoveToConveyor,
    handleDropToBottom,
    handleMoveToOtherPosition,
    handleSaveToDatabase,
    handleBackToList,
  };
};