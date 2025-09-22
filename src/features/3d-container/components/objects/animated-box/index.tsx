import React, { useCallback, useEffect } from 'react';
import { useContainerStore, containerActions } from '@/entities/container';
import { useBoxAnimation } from '@/features/3d-container/hooks/useBoxAnimation';
import { usePhysicsValidation } from '@/features/3d-container/hooks/usePhysicsValidation';
import { use3DInteraction } from '@/features/3d-container/hooks/use3DInteraction';
import BoxMesh from './box-mesh';
import BoxInteractions from './box-interactions';

interface AnimatedBoxProps {
  boxId: string;
  onSelect: (boxId: string) => void;
}

/**
 * 최적화된 애니메이션 박스 컴포넌트
 * 렌더링, 상호작용, 애니메이션 로직을 분리
 */
const AnimatedBox: React.FC<AnimatedBoxProps> = ({
  boxId,
  onSelect,
}) => {
  console.log(`🔄 AnimatedBox ${boxId} 렌더링`);

  // 이 박스의 데이터만 구독
  const boxData = useContainerStore(
    useCallback((state) => state.boxes.get(boxId), [boxId]),
  );

  // 선택 상태만 별도 구독
  const isSelected = useContainerStore(
    useCallback((state) => state.selectedBoxId === boxId, [boxId]),
  );

  // 박스 데이터가 없으면 렌더링하지 않음
  if (!boxData) {
    console.log(`❌ AnimatedBox ${boxId}: 박스 데이터 없음`);
    return null;
  }

  // 애니메이션 훅
  const {
    meshRef,
    moveState,
    moveToPosition,
    startSequentialMove,
    nextPhase,
    completeSequentialMove
  } = useBoxAnimation(boxData, (x, y, z) => {
    containerActions.moveBox(boxId, x, y, z);
  });

  // 물리 검증 훅
  const { stabilityInfo } = usePhysicsValidation(
    boxData.id,
    boxData.x,
    boxData.y,
    boxData.z,
    boxData.lenX,
    boxData.lenY,
    boxData.lenZ
  );

  // 3D 상호작용 훅
  const { handleBoxClick } = use3DInteraction(boxId, onSelect);

  // 박스 데이터가 변경되면 targetPosition 업데이트
  useEffect(() => {
    console.log(
      `📍 ${boxId} 위치 동기화: (${boxData.x}, ${boxData.y}, ${boxData.z})`,
    );
    moveToPosition(boxData.x, boxData.y, boxData.z);
  }, [boxData.x, boxData.y, boxData.z, boxId, moveToPosition]);

  console.log(`✅ ${boxId} 렌더링 완료`);

  return (
    <group>
      <BoxMesh
        ref={meshRef}
        boxData={boxData}
        isSelected={isSelected}
        stabilityInfo={stabilityInfo}
        movementPhase={moveState.movementPhase}
        isSequentialMoving={moveState.isSequentialMoving}
        onBoxClick={handleBoxClick}
      />
      
      <BoxInteractions
        boxData={boxData}
        onPositionUpdate={(x, y, z) => containerActions.moveBox(boxId, x, y, z)}
      />
    </group>
  );
};

// React.memo 최적화: boxId가 같으면 리렌더링 방지
export default React.memo(AnimatedBox, (prevProps, nextProps) => {
  const shouldUpdate =
    prevProps.boxId !== nextProps.boxId ||
    prevProps.onSelect !== nextProps.onSelect;

  if (!shouldUpdate) {
    console.log(`🚫 ${prevProps.boxId} 리렌더링 방지`);
  }

  return !shouldUpdate;
});
