import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { containerApi, type Container3D } from '../api/containerApi';
import { useContainerStore, containerActions } from '@/entities/container';
import type { BoxData } from '@/entities/box';

/**
 * 컨테이너 데이터를 TanStack Query로 관리하는 훅
 */
export const useContainerQuery = (containerId: string) => {
  const queryClient = useQueryClient();
  
  // 컨테이너 상세 정보 조회
  const containerQuery = useQuery({
    queryKey: ['container', containerId],
    queryFn: async () => {
      console.log(`📦 컨테이너 데이터 로딩 시작: ${containerId}`);
      return await containerApi.getContainer(containerId);
    },
    enabled: !!containerId,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000,   // 10분 (v4에서는 gcTime 대신 cacheTime 사용)
  });

  // 컨테이너의 박스 데이터 조회
  const boxesQuery = useQuery({
    queryKey: ['container-boxes', containerId],
    queryFn: async () => {
      console.log(`📦 박스 데이터 로딩 시작: ${containerId}`);
      return await containerApi.getContainerBoxes(containerId);
    },
    enabled: !!containerId && containerQuery.isSuccess,
    staleTime: 2 * 60 * 1000, // 2분
    cacheTime: 5 * 60 * 1000,    // 5분 (v4에서는 gcTime 대신 cacheTime 사용)
  });

  // 컨테이너 + 박스 데이터를 함께 로드하는 mutation
  const loadContainerMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`📦 컨테이너 전체 데이터 로딩: ${id}`);
      const [container, boxes] = await Promise.all([
        containerApi.getContainer(id),
        containerApi.getContainerBoxes(id)
      ]);
      
      if (!container) {
        throw new Error('컨테이너를 찾을 수 없습니다.');
      }
      
      return { container, boxes };
    },
    onMutate: () => {
      // 로딩 시작
      containerActions.startLoading();
    },
    onSuccess: (data) => {
      // Zustand Store에 데이터 저장
      containerActions.loadContainerData(data.container, data.boxes);
      console.log(`✅ 컨테이너 데이터 로딩 완료: ${data.container.name} (박스 ${data.boxes.length}개)`);
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : '컨테이너를 불러오는데 실패했습니다.';
      containerActions.setLoadingError(errorMsg);
      console.error('❌ 컨테이너 데이터 로딩 실패:', errorMsg);
    }
  });

  // 박스 데이터 저장 mutation
  const saveBoxesMutation = useMutation({
    mutationFn: async ({ containerId, boxes }: { containerId: string; boxes: BoxData[] }) => {
      console.log(`💾 박스 데이터 저장 시작: ${containerId}`);
      await containerApi.syncContainerBoxes(containerId, boxes);
    },
    onSuccess: () => {
      console.log('✅ 박스 데이터 저장 완료');
      // 박스 쿼리 무효화하여 최신 데이터 반영 (v4 방식)
      queryClient.invalidateQueries(['container-boxes', containerId]);
    },
    onError: (error) => {
      console.error('❌ 박스 데이터 저장 실패:', error);
    }
  });

  return {
    // Queries
    container: containerQuery.data,
    boxes: boxesQuery.data || [],
    isLoading: containerQuery.isLoading || boxesQuery.isLoading,
    isError: containerQuery.isError || boxesQuery.isError,
    error: containerQuery.error || boxesQuery.error,
    
    // Mutations
    loadContainer: loadContainerMutation.mutate,
    loadContainerAsync: loadContainerMutation.mutateAsync,
    saveBoxes: saveBoxesMutation.mutate,
    saveBoxesAsync: saveBoxesMutation.mutateAsync,
    
    // States
    isContainerLoading: loadContainerMutation.isPending,
    isSaving: saveBoxesMutation.isPending,
    
    // Utils
    refetch: () => {
      containerQuery.refetch();
      boxesQuery.refetch();
    }
  };
};
