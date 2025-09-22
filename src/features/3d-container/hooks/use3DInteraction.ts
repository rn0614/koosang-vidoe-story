import { useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';

/**
 * 3D 상호작용을 관리하는 커스텀 훅
 */
export const use3DInteraction = (
  boxId: string,
  onSelect: (boxId: string) => void
) => {
  // 박스 클릭 핸들러
  const handleBoxClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    console.log(`🎯 ${boxId} 3D 박스 클릭`);
    onSelect(boxId);
  }, [onSelect, boxId]);

  // 박스 호버 핸들러 (나중에 확장 가능)
  const handleBoxHover = useCallback((e: ThreeEvent<MouseEvent>) => {
    // 호버 효과 구현
    document.body.style.cursor = 'pointer';
  }, []);

  // 박스 호버 해제 핸들러
  const handleBoxHoverOut = useCallback((e: ThreeEvent<MouseEvent>) => {
    document.body.style.cursor = 'default';
  }, []);

  return {
    handleBoxClick,
    handleBoxHover,
    handleBoxHoverOut
  };
};
