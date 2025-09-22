import { useMemo } from 'react';
import { useBoxStore, BoxPhysics } from '@/entities/box';

/**
 * 물리 검증 관련 로직을 관리하는 커스텀 훅
 */
export const usePhysicsValidation = (
  boxId: string,
  x: number,
  y: number,
  z: number,
  lenX: number,
  lenY: number,
  lenZ: number
) => {
  // 스토어에서 필요한 메서드들 가져오기
  const boxes = useBoxStore((state) => state.boxes);
  
  // 안정성 정보 계산 (위치/크기 변경시에만 재계산)
  const stabilityInfo = useMemo(() => {
    console.log(`🔍 ${boxId} 안정성 검사 재계산`);
    return BoxPhysics.checkBoxStability(x, y, z, lenX, lenY, lenZ, boxes, boxId);
  }, [x, y, z, lenX, lenY, lenZ, boxId, boxes]);

  // 위치 유효성 검사
  const isPositionValid = useMemo(() => {
    return BoxPhysics.isPositionAvailable(x, y, z, lenX, lenY, lenZ, boxes, boxId);
  }, [x, y, z, lenX, lenY, lenZ, boxId, boxes]);

  // 가장 가까운 사용 가능한 위치 찾기
  const findNearestPosition = (targetX: number, targetY: number, targetZ: number) => {
    return BoxPhysics.findNearestAvailablePosition(
      targetX, 
      targetY, 
      targetZ, 
      lenX, 
      lenY, 
      lenZ, 
      boxes, 
      boxId
    );
  };

  // 기존 코드와 호환성을 위한 3개 매개변수 버전 (컨베이어용)
  const findNearestPositionLegacy = (targetX: number, targetY: number, targetZ: number) => {
    // 기존 로직: 컨베이어에서는 크기를 0으로 설정
    return BoxPhysics.findNearestAvailablePosition(
      targetX, 
      targetY, 
      targetZ, 
      0, // 컨베이어에서는 박스 크기 무시
      0, 
      0, 
      boxes, 
      boxId
    );
  };

  // 최소 Y 위치 찾기
  const findMinimumY = (targetX: number, targetZ: number) => {
    return BoxPhysics.findMinimumYPosition(targetX, targetZ, lenX, lenY, lenZ, boxes, boxId);
  };

  return {
    stabilityInfo,
    isPositionValid,
    findNearestPosition,
    findNearestPositionLegacy,
    findMinimumY
  };
};
