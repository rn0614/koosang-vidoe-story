import React, { useRef, useReducer, useMemo, useCallback } from 'react';
import { Box, Text } from '@react-three/drei';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { BoxMethods } from '@/entities/box/types';
import { useContainerStore } from '@/entities/container';
import { BoxPhysics } from '@/entities/box/model/physics';

interface AnimatedBoxProps {
  boxId: string;
  onSelect: (boxId: string) => void;
}

type MovePhase = 'idle' | 'to_conveyor' | 'on_conveyor' | 'dropping';

interface MoveState {
  targetPosition: [number, number, number];
  isAnimating: boolean;
  isSequentialMoving: boolean;
  movementPhase: MovePhase;
  finalTargetX: number;
  finalTargetZ: number;
  sequentialResolve: (() => void) | null;
}

type MoveAction =
  | { type: 'SET_TARGET_POSITION'; payload: [number, number, number] }
  | { type: 'SET_ANIMATING'; payload: boolean }
  | { type: 'START_SEQUENTIAL'; x: number; z: number; resolve: () => void }
  | { type: 'SET_PHASE'; phase: MovePhase }
  | { type: 'END_SEQUENTIAL' }
  | { type: 'SET_RESOLVE'; resolve: (() => void) | null };

const initialMoveState: MoveState = {
  targetPosition: [0, 0, 0],
  isAnimating: false,
  isSequentialMoving: false,
  movementPhase: 'idle',
  finalTargetX: 0,
  finalTargetZ: 0,
  sequentialResolve: null,
};

function moveReducer(state: MoveState, action: MoveAction): MoveState {
  switch (action.type) {
    case 'SET_TARGET_POSITION':
      return { ...state, targetPosition: action.payload, isAnimating: true };
    case 'SET_ANIMATING':
      return { ...state, isAnimating: action.payload };
    case 'START_SEQUENTIAL':
      return {
        ...state,
        isSequentialMoving: true,
        movementPhase: 'to_conveyor',
        finalTargetX: action.x,
        finalTargetZ: action.z,
        sequentialResolve: action.resolve,
      };
    case 'SET_PHASE':
      return { ...state, movementPhase: action.phase };
    case 'END_SEQUENTIAL':
      return {
        ...state,
        isSequentialMoving: false,
        movementPhase: 'idle',
        sequentialResolve: null,
      };
    case 'SET_RESOLVE':
      return { ...state, sequentialResolve: action.resolve };
    default:
      return state;
  }
}

const AnimatedBoxComponent: React.FC<AnimatedBoxProps> = ({
  boxId,
  onSelect,
}) => {
  console.log(`🔄 AnimatedBox ${boxId} 렌더링`);
  const handleCardClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      console.log(`🎯 ${boxId} 카드 클릭`);
      onSelect(boxId);
    },
    [onSelect, boxId],
  );

  // 🚀 핵심 최적화: 이 박스의 데이터만 구독 (회전값 포함)
  const boxData = useContainerStore(
    useCallback((state) => state.boxes.get(boxId), [boxId]),
  );

  // 🚀 선택 상태만 별도 구독
  const isSelected = useContainerStore(
    useCallback((state) => state.selectedBoxId === boxId, [boxId]),
  );

  // 🚀 스토어 메서드들은 한 번만 가져오기 (리렌더링과 무관)
  const { updateBoxPosition } = useContainerStore.getState();

  const meshRef = useRef<Mesh>(null);

  // 박스 데이터가 없으면 렌더링하지 않음
  if (!boxData) {
    console.log(`❌ AnimatedBox ${boxId}: 박스 데이터 없음`);
    return null;
  }

  // useReducer로 이동 관련 상태 통합
  const [moveState, dispatch] = useReducer(moveReducer, {
    ...initialMoveState,
    targetPosition: [boxData.x, boxData.y, boxData.z],
  });

  // 🎯 stabilityInfo는 useMemo로 계산 (박스 위치/크기 변경시에만 재계산)
  const stabilityInfo = useMemo(() => {
    console.log(`🔍 ${boxId} 안정성 검사 재계산`);
    const allBoxes = useContainerStore.getState().boxes;
    return BoxPhysics.checkBoxStability(
      boxData.x,
      boxData.y,
      boxData.z,
      boxData.lenX,
      boxData.lenY,
      boxData.lenZ,
      allBoxes,
      boxData.id,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    boxData.x,
    boxData.y,
    boxData.z,
    boxData.lenX,
    boxData.lenY,
    boxData.lenZ,
    boxData.id,
    // checkBoxStability 함수 참조 제외
  ]);

  // 박스 중심 좌표 계산 (렌더링용)
  const centerX = boxData.x - boxData.lenX / 2;
  const centerY = boxData.y - boxData.lenY / 2;
  const centerZ = boxData.z - boxData.lenZ / 2;
  
  // 회전값 계산 (도 → 라디안)
  const rotationX = (boxData.rotX || 0) * (Math.PI / 180);
  const rotationY = (boxData.rotY || 0) * (Math.PI / 180);
  const rotationZ = (boxData.rotZ || 0) * (Math.PI / 180);

  // 박스 데이터가 변경되면 targetPosition 업데이트
  React.useEffect(() => {
    console.log(
      `📍 ${boxId} 위치 동기화: (${boxData.x}, ${boxData.y}, ${boxData.z})`,
    );
    dispatch({
      type: 'SET_TARGET_POSITION',
      payload: [boxData.x, boxData.y, boxData.z],
    });
  }, [boxData.x, boxData.y, boxData.z, boxId]);

  // 애니메이션 완료 감지 및 시퀀셜 이동 단계 처리
  React.useEffect(() => {
    if (!moveState.isAnimating && moveState.isSequentialMoving) {
      handleMovementPhaseComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveState.isAnimating, moveState.isSequentialMoving]); // handleMovementPhaseComplete 의존성 제외

  // 시퀀셜 이동 단계별 처리
  const handleMovementPhaseComplete = useCallback(() => {
    switch (moveState.movementPhase) {
      case 'to_conveyor': {
        dispatch({ type: 'SET_PHASE', phase: 'on_conveyor' });
        const conveyorY = 15;
        const allBoxes = useContainerStore.getState().boxes;
        const targetOnConveyor = BoxPhysics.findNearestAvailablePosition(
          moveState.finalTargetX,
          conveyorY,
          moveState.finalTargetZ,
          boxData.lenX,
          boxData.lenY,
          boxData.lenZ,
          allBoxes,
          boxData.id,
        );
        moveToPosition(
          targetOnConveyor.x,
          targetOnConveyor.y,
          targetOnConveyor.z,
        );
        break;
      }
      case 'on_conveyor': {
        dispatch({ type: 'SET_PHASE', phase: 'dropping' });
        const currentX = moveState.targetPosition[0];
        const currentZ = moveState.targetPosition[2];
        const allBoxes = useContainerStore.getState().boxes;
        const minY = BoxPhysics.findMinimumYPosition(
          currentX,
          currentZ,
          boxData.lenX,
          boxData.lenY,
          boxData.lenZ,
          allBoxes,
          boxData.id,
        );
        moveToPosition(currentX, minY, currentZ);
        break;
      }
      case 'dropping': {
        dispatch({ type: 'END_SEQUENTIAL' });
        if (moveState.sequentialResolve) {
          moveState.sequentialResolve();
        }
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveState.movementPhase, moveState.finalTargetX, moveState.finalTargetZ, moveState.targetPosition, moveState.sequentialResolve, boxData.id, boxData.lenX, boxData.lenY, boxData.lenZ]); // moveState 전체 객체 제외

  // 🎯 3D 애니메이션 프레임 처리
  useFrame((state, delta) => {
    if (meshRef.current && moveState.isAnimating) {
      const currentPos = meshRef.current.position;
      const targetCenterX = moveState.targetPosition[0] - boxData.lenX / 2;
      const targetCenterY = moveState.targetPosition[1] - boxData.lenY / 2;
      const targetCenterZ = moveState.targetPosition[2] - boxData.lenZ / 2;
      const target = new Vector3(targetCenterX, targetCenterY, targetCenterZ);
      const distance = currentPos.distanceTo(target);

      if (distance > 0.1) {
        currentPos.lerp(target, delta * 3);
      } else {
        currentPos.copy(target);
        dispatch({ type: 'SET_ANIMATING', payload: false });

        // 🚀 스토어 업데이트: 애니메이션 완료 후 실제 위치를 스토어에 반영
        // 스토어의 현재 박스 위치와 비교하여 실제로 변경된 경우에만 업데이트
        const [x, y, z] = moveState.targetPosition;
        const currentBoxData = useContainerStore.getState().boxes.get(boxId);
        if (currentBoxData && (currentBoxData.x !== x || currentBoxData.y !== y || currentBoxData.z !== z)) {
          console.log(`💾 ${boxId} 위치 스토어 업데이트: (${x}, ${y}, ${z})`);
          updateBoxPosition(boxId, x, y, z);
        }
      }
    }
  });

  // 이동 명령 함수들
  const moveToPosition = useCallback(
    (x: number, y: number, z: number): void => {
      console.log(`🎯 ${boxId} 이동 명령: (${x}, ${y}, ${z})`);
      dispatch({ type: 'SET_TARGET_POSITION', payload: [x, y, z] });
    },
    [boxId],
  );

  const dropToBottom = useCallback((): void => {
    if (moveState.isSequentialMoving) return;

    const currentX = moveState.targetPosition[0];
    const currentZ = moveState.targetPosition[2];
    const allBoxes = useContainerStore.getState().boxes;
    const minY = BoxPhysics.findMinimumYPosition(
      currentX,
      currentZ,
      boxData.lenX,
      boxData.lenY,
      boxData.lenZ,
      allBoxes,
      boxData.id,
    );
    moveToPosition(currentX, minY, currentZ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveState.isSequentialMoving, moveState.targetPosition[0], moveState.targetPosition[2], boxData.id, boxData.lenX, boxData.lenY, boxData.lenZ]); // 함수 참조 제외

  const moveToConveyor = useCallback((): void => {
    if (moveState.isSequentialMoving) return;

    const conveyorY = 15;
    const allBoxes = useContainerStore.getState().boxes;
    const conveyorPosition = BoxPhysics.findNearestAvailablePosition(
      boxData.x,
      conveyorY,
      boxData.z,
      boxData.lenX,
      boxData.lenY,
      boxData.lenZ,
      allBoxes,
      boxData.id,
    );
    moveToPosition(conveyorPosition.x, conveyorPosition.y, conveyorPosition.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveState.isSequentialMoving, boxData.x, boxData.z, boxData.id, boxData.lenX, boxData.lenY, boxData.lenZ]); // 함수 참조 제외

  const moveToOtherPosition = useCallback(
    (x: number, z: number): Promise<void> => {
      return new Promise((resolve) => {
        dispatch({ type: 'START_SEQUENTIAL', x, z, resolve });
        const conveyorY = 15;
        const allBoxes = useContainerStore.getState().boxes;
        const conveyorPosition = BoxPhysics.findNearestAvailablePosition(
          boxData.x,
          conveyorY,
          boxData.z,
          boxData.lenX,
          boxData.lenY,
          boxData.lenZ,
          allBoxes,
          boxData.id,
        );
        moveToPosition(
          conveyorPosition.x,
          conveyorPosition.y,
          conveyorPosition.z,
        );
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [boxData.x, boxData.z, boxData.id, boxData.lenX, boxData.lenY, boxData.lenZ], // 함수 참조 제외
  );

  // ref 메서드들 등록
  React.useImperativeHandle(
    boxData.ref,
    (): BoxMethods => ({
      moveToPosition,
      moveToConveyor,
      dropToBottom,
      moveToOtherPosition,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boxId], // 함수 참조 대신 boxId만 의존성으로 설정
  );

  // 색상/상태 텍스트 계산
  const getBoxColor = (): string => {
    if (isSelected) return '#ff4444';
    if (moveState.isSequentialMoving) {
      switch (moveState.movementPhase) {
        case 'to_conveyor':
          return '#ffaa00';
        case 'on_conveyor':
          return '#00aaff';
        case 'dropping':
          return '#aa00ff';
        default:
          return '#000000';
      }
    }
    if (!stabilityInfo) return '#000000';
    if (stabilityInfo.isStable) {
      return '#000000';
    } else {
      return '#ff9999';
    }
  };

  const getStatusText = (): string => {
    if (!moveState.isSequentialMoving) return boxData.id;
    switch (moveState.movementPhase) {
      case 'to_conveyor':
        return `${boxData.id} ↑`;
      case 'on_conveyor':
        return `${boxData.id} →`;
      case 'dropping':
        return `${boxData.id} ↓`;
      default:
        return boxData.id;
    }
  };

  console.log(`✅ ${boxId} 렌더링 완료`);

  return (
    <group>
      <Box
        ref={meshRef}
        position={[centerX, centerY, centerZ]}
        rotation={[rotationX, rotationY, rotationZ]}
        args={[boxData.lenX, boxData.lenY, boxData.lenZ]}
        onClick={handleCardClick}
      >
        <meshStandardMaterial
          color={getBoxColor()}
          transparent
          opacity={isSelected ? 0.8 : 0.7}
        />
      </Box>
      <Text
        position={[centerX, centerY + boxData.lenY / 2 + 0.5, centerZ]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {getStatusText()}
      </Text>
      <Box position={[0, 0, 0]} args={[0.2, 0.2, 0.2]}>
        <meshBasicMaterial color="#00ff00" />
      </Box>
      {stabilityInfo && !moveState.isSequentialMoving && (
        <Text
          position={[
            centerX - boxData.lenX / 2 - 0.5,
            centerY + boxData.lenY / 2 + 0.5,
            centerZ,
          ]}
          fontSize={0.3}
          color={stabilityInfo.isStable ? '#00ff00' : '#ff0000'}
          anchorX="center"
          anchorY="middle"
        >
          {stabilityInfo.isStable ? '✓' : '⚠'}
        </Text>
      )}
    </group>
  );
};

// 🚀 React.memo 최적화: boxId가 같으면 리렌더링 방지
const AnimatedBox = React.memo(AnimatedBoxComponent, (prevProps, nextProps) => {
  const shouldUpdate =
    prevProps.boxId !== nextProps.boxId ||
    prevProps.onSelect !== nextProps.onSelect;

  if (!shouldUpdate) {
    console.log(`🚫 ${prevProps.boxId} 리렌더링 방지`);
  }

  return !shouldUpdate;
});

export default AnimatedBox;
