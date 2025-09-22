import { useCallback, useState } from 'react';
import { BoxOperations } from '../index';

/**
 * 박스 이동 관련 로직을 관리하는 커스텀 훅
 */
export const useBoxMovement = () => {
  const [isMoving, setIsMoving] = useState<string | null>(null);
  
  // 컨베이어로 이동
  const moveToConveyor = useCallback(async (boxId: string) => {
    try {
      setIsMoving(boxId);
      await BoxOperations.moveBoxToConveyor(boxId);
    } catch (error) {
      console.error(`Failed to move box ${boxId} to conveyor:`, error);
      throw error;
    } finally {
      setIsMoving(null);
    }
  }, []);
  
  // 바닥으로 드롭
  const dropToBottom = useCallback(async (boxId: string) => {
    try {
      setIsMoving(boxId);
      await BoxOperations.dropBoxToBottom(boxId);
    } catch (error) {
      console.error(`Failed to drop box ${boxId} to bottom:`, error);
      throw error;
    } finally {
      setIsMoving(null);
    }
  }, []);
  
  // 다른 위치로 시퀀셜 이동
  const moveToOtherPosition = useCallback(async (boxId: string, x: number, z: number) => {
    try {
      setIsMoving(boxId);
      await BoxOperations.moveBoxToPosition(boxId, x, z);
    } catch (error) {
      console.error(`Failed to move box ${boxId} to position (${x}, ${z}):`, error);
      throw error;
    } finally {
      setIsMoving(null);
    }
  }, []);
  
  // 즉시 이동
  const moveImmediate = useCallback((boxId: string, x: number, y: number, z: number) => {
    try {
      BoxOperations.moveBoxImmediate(boxId, x, y, z);
    } catch (error) {
      console.error(`Failed to move box ${boxId} immediately:`, error);
      throw error;
    }
  }, []);
  
  // 이동 상태 확인
  const isBoxMoving = useCallback((boxId: string) => {
    return isMoving === boxId;
  }, [isMoving]);
  
  return {
    moveToConveyor,
    dropToBottom,
    moveToOtherPosition,
    moveImmediate,
    isBoxMoving,
    isAnyBoxMoving: isMoving !== null
  };
};