import { useCallback } from 'react';
import { useBoxStore, BoxOperations } from '../index';

/**
 * 박스 선택 관련 로직을 관리하는 커스텀 훅
 */
export const useBoxSelection = () => {
  // 선택된 박스 ID만 구독
  const selectedBoxId = useBoxStore((state) => state.selectedBoxId);
  
  // 박스 선택 핸들러
  const selectBox = useCallback((boxId: string | null) => {
    BoxOperations.selectBox(boxId);
  }, []);
  
  // 선택 해제
  const clearSelection = useCallback(() => {
    BoxOperations.selectBox(null);
  }, []);
  
  // 특정 박스가 선택되었는지 확인
  const isBoxSelected = useCallback((boxId: string) => {
    return selectedBoxId === boxId;
  }, [selectedBoxId]);
  
  // 선택된 박스 데이터 가져오기
  const getSelectedBox = useCallback(() => {
    return BoxOperations.getSelectedBox();
  }, [selectedBoxId]);
  
  return {
    selectedBoxId,
    selectBox,
    clearSelection,
    isBoxSelected,
    getSelectedBox
  };
};