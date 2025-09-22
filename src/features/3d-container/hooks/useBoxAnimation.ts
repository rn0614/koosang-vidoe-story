import { useReducer, useCallback, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { BoxData } from '@/entities/box';

// 이동 단계 타입
type MovePhase = 'idle' | 'to_conveyor' | 'on_conveyor' | 'dropping';

// 이동 상태 인터페이스
interface MoveState {
  targetPosition: [number, number, number];
  isAnimating: boolean;
  isSequentialMoving: boolean;
  movementPhase: MovePhase;
  finalTargetX: number;
  finalTargetZ: number;
  sequentialResolve: (() => void) | null;
}

// 이동 액션 타입
type MoveAction =
  | { type: 'SET_TARGET_POSITION'; payload: [number, number, number] }
  | { type: 'SET_ANIMATING'; payload: boolean }
  | { type: 'START_SEQUENTIAL'; x: number; z: number; resolve: () => void }
  | { type: 'SET_PHASE'; phase: MovePhase }
  | { type: 'END_SEQUENTIAL' }
  | { type: 'SET_RESOLVE'; resolve: (() => void) | null };

// 초기 상태
const initialMoveState: MoveState = {
  targetPosition: [0, 0, 0],
  isAnimating: false,
  isSequentialMoving: false,
  movementPhase: 'idle',
  finalTargetX: 0,
  finalTargetZ: 0,
  sequentialResolve: null,
};

// 리듀서
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

/**
 * 박스 애니메이션을 관리하는 커스텀 훅
 */
export const useBoxAnimation = (
  boxData: BoxData,
  onPositionUpdate: (x: number, y: number, z: number) => void
) => {
  const meshRef = useRef<Mesh>(null);
  
  // useReducer로 이동 관련 상태 통합
  const [moveState, dispatch] = useReducer(moveReducer, {
    ...initialMoveState,
    targetPosition: [boxData.x, boxData.y, boxData.z],
  });

  // 3D 애니메이션 프레임 처리
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

        // 애니메이션 완료 후 위치 업데이트
        const [x, y, z] = moveState.targetPosition;
        console.log(`💾 ${boxData.id} 위치 업데이트: (${x}, ${y}, ${z})`);
        onPositionUpdate(x, y, z);
      }
    }
  });

  // 이동 명령 함수
  const moveToPosition = useCallback((x: number, y: number, z: number): void => {
    console.log(`🎯 ${boxData.id} 이동 명령: (${x}, ${y}, ${z})`);
    dispatch({ type: 'SET_TARGET_POSITION', payload: [x, y, z] });
  }, [boxData.id]);

  // 시퀀셜 이동 시작
  const startSequentialMove = useCallback((x: number, z: number): Promise<void> => {
    return new Promise((resolve) => {
      dispatch({ type: 'START_SEQUENTIAL', x, z, resolve });
    });
  }, []);

  // 다음 단계로 진행
  const nextPhase = useCallback((phase: MovePhase) => {
    dispatch({ type: 'SET_PHASE', phase });
  }, []);

  // 시퀀셜 이동 완료
  const completeSequentialMove = useCallback(() => {
    dispatch({ type: 'END_SEQUENTIAL' });
    if (moveState.sequentialResolve) {
      moveState.sequentialResolve();
    }
  }, [moveState.sequentialResolve]);

  return {
    meshRef,
    moveState,
    moveToPosition,
    startSequentialMove,
    nextPhase,
    completeSequentialMove
  };
};
