import React, { useImperativeHandle, useCallback } from 'react';
import { BoxMethods, BoxData } from '@/entities/box';
import { useBoxAnimation } from '@/features/3d-container/hooks/useBoxAnimation';
import { usePhysicsValidation } from '@/features/3d-container/hooks/usePhysicsValidation';

interface BoxInteractionsProps {
  boxData: BoxData;
  onPositionUpdate: (x: number, y: number, z: number) => void;
}

/**
 * 박스 상호작용 로직을 관리하는 컴포넌트
 * 메서드 등록과 물리 계산을 담당
 */
const BoxInteractions: React.FC<BoxInteractionsProps> = ({
  boxData,
  onPositionUpdate,
}) => {
  const {
    moveState,
    moveToPosition,
    startSequentialMove,
    nextPhase,
    completeSequentialMove,
  } = useBoxAnimation(boxData, onPositionUpdate);

  const { findNearestPosition, findNearestPositionLegacy, findMinimumY } = usePhysicsValidation(
    boxData.id,
    boxData.x,
    boxData.y,
    boxData.z,
    boxData.lenX,
    boxData.lenY,
    boxData.lenZ,
  );

  // 바닥으로 드롭
  const dropToBottom = useCallback((): void => {
    if (moveState.isSequentialMoving) return;

    const currentX = moveState.targetPosition[0];
    const currentZ = moveState.targetPosition[2];
    const minY = findMinimumY(currentX, currentZ);
    moveToPosition(currentX, minY, currentZ);
  }, [
    moveState.isSequentialMoving,
    moveState.targetPosition,
    findMinimumY,
    moveToPosition,
  ]);

  // 컨베이어로 이동
  const moveToConveyor = useCallback((): void => {
    if (moveState.isSequentialMoving) return;

    const conveyorY = 15;
    // 기존 로직과 동일하게 크기를 0으로 설정 (컨베이어 위의 빈 공간 찾기)
    const conveyorPosition = findNearestPositionLegacy(
      boxData.x,
      conveyorY,
      boxData.z,
    );
    moveToPosition(conveyorPosition.x, conveyorPosition.y, conveyorPosition.z);
  }, [
    moveState.isSequentialMoving,
    boxData,
    findNearestPositionLegacy,
    moveToPosition,
  ]);

  // 다른 위치로 시퀀셜 이동
  const moveToOtherPosition = useCallback(
    (x: number, z: number): Promise<void> => {
      return new Promise((resolve) => {
        startSequentialMove(x, z).then(resolve);
        const conveyorY = 15;
        const conveyorPosition = findNearestPositionLegacy(
          boxData.x,
          conveyorY,
          boxData.z,
        );
        moveToPosition(
          conveyorPosition.x,
          conveyorPosition.y,
          conveyorPosition.z,
        );
      });
    },
    [boxData, findNearestPositionLegacy, moveToPosition, startSequentialMove],
  );

  // 시퀀셜 이동 단계별 처리
  const handleMovementPhaseComplete = useCallback(() => {
    switch (moveState.movementPhase) {
      case 'to_conveyor': {
        nextPhase('on_conveyor');
        const conveyorY = 15;
        const targetOnConveyor = findNearestPosition(
          moveState.finalTargetX,
          conveyorY,
          moveState.finalTargetZ,
        );
        moveToPosition(
          targetOnConveyor.x,
          targetOnConveyor.y,
          targetOnConveyor.z,
        );
        break;
      }
      case 'on_conveyor': {
        nextPhase('dropping');
        const currentX = moveState.targetPosition[0];
        const currentZ = moveState.targetPosition[2];
        const minY = findMinimumY(currentX, currentZ);
        moveToPosition(currentX, minY, currentZ);
        break;
      }
      case 'dropping': {
        completeSequentialMove();
        break;
      }
    }
  }, [
    moveState,
    findNearestPosition,
    findMinimumY,
    moveToPosition,
    nextPhase,
    completeSequentialMove,
  ]);

  // ref 메서드들 등록
  useImperativeHandle(
    boxData.ref,
    (): BoxMethods => ({
      moveToPosition,
      moveToConveyor,
      dropToBottom,
      moveToOtherPosition,
    }),
    [moveToPosition, moveToConveyor, dropToBottom, moveToOtherPosition],
  );

  // 애니메이션 완료 감지 및 시퀀셜 이동 단계 처리
  React.useEffect(() => {
    if (!moveState.isAnimating && moveState.isSequentialMoving) {
      handleMovementPhaseComplete();
    }
  }, [moveState.isAnimating, moveState.isSequentialMoving, handleMovementPhaseComplete]);

  return null; // 이 컴포넌트는 렌더링하지 않음
};

export default BoxInteractions;
