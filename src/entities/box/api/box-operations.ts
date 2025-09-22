import React from 'react';
import { BoxData, BoxMethods } from '../types';
import { useContainerStore } from '@/entities/container';

/**
 * 박스 조작을 위한 API 함수들
 * 비즈니스 로직과 상태 관리를 캡슐화
 */
export class BoxOperations {
  /**
   * 새로운 박스 생성
   */
  static createBox(
    id: string,
    x: number,
    y: number,
    z: number,
    lenX: number = 2,
    lenY: number = 2,
    lenZ: number = 2,
    color: string = '#4299e1',
    rotX: number = 0,
    rotY: number = 0,
    rotZ: number = 0
  ): BoxData {
    return {
      id,
      x,
      y,
      z,
      lenX,
      lenY,
      lenZ,
      color,
      rotX,
      rotY,
      rotZ,
      ref: React.createRef<BoxMethods>()
    };
  }

  /**
   * 박스를 컨베이어 벨트로 이동
   */
  static async moveBoxToConveyor(boxId: string): Promise<void> {
    const { getBoxRef, getBox } = useContainerStore.getState();
    const ref = getBoxRef(boxId);
    const box = getBox(boxId);
    
    if (!ref?.current || !box) {
      throw new Error(`Box ${boxId} not found or invalid reference`);
    }

    // 컨베이어로 이동하는 로직은 AnimatedBox 컴포넌트에서 처리
    ref.current.moveToConveyor();
  }

  /**
   * 박스를 바닥으로 떨어뜨리기
   */
  static async dropBoxToBottom(boxId: string): Promise<void> {
    const { getBoxRef } = useContainerStore.getState();
    const ref = getBoxRef(boxId);
    
    if (!ref?.current) {
      throw new Error(`Box ${boxId} not found or invalid reference`);
    }

    ref.current.dropToBottom();
  }

  /**
   * 박스를 특정 위치로 시퀀셜 이동
   */
  static async moveBoxToPosition(boxId: string, x: number, z: number): Promise<void> {
    const { getBoxRef } = useContainerStore.getState();
    const ref = getBoxRef(boxId);
    
    if (!ref?.current) {
      throw new Error(`Box ${boxId} not found or invalid reference`);
    }

    await ref.current.moveToOtherPosition(x, z);
  }

  /**
   * 박스를 정확한 위치로 즉시 이동
   */
  static moveBoxImmediate(boxId: string, x: number, y: number, z: number): void {
    const { getBoxRef, updateBoxPosition } = useContainerStore.getState();
    const ref = getBoxRef(boxId);
    
    if (!ref?.current) {
      throw new Error(`Box ${boxId} not found or invalid reference`);
    }

    ref.current.moveToPosition(x, y, z);
    updateBoxPosition(boxId, x, y, z);
  }

  /**
   * 새로운 박스 추가 (컨베이어 벨트에)
   */
  static addNewBox(nextBoxId: number, generateColor: () => string): BoxData {
    const { addBox } = useContainerStore.getState();
    
    const newBoxId = `BOX-${String(nextBoxId).padStart(3, '0')}`;
    const conveyorY = 15;

    // 간단한 위치 계산 (컨베이어 벨트 위)
    const newBox = this.createBox(
      newBoxId,
      0,
      conveyorY,
      0,
      2,
      2,
      2,
      generateColor()
    );

    addBox(newBox);
    return newBox;
  }

  /**
   * 박스 선택
   */
  static selectBox(boxId: string | null): void {
    const { setSelectedBoxId } = useContainerStore.getState();
    setSelectedBoxId(boxId);
  }

  /**
   * 박스 검증 (위치가 유효한지 확인)
   */
  static validateBoxPosition(
    x: number,
    y: number,
    z: number,
    lenX: number,
    lenY: number,
    lenZ: number,
    excludeBoxId?: string
  ): { isValid: boolean; message?: string } {
    const { boxes } = useContainerStore.getState();
    
    // 기본 범위 검증
    if (y < 2) {
      return { isValid: false, message: 'Y 좌표는 2 이상이어야 합니다.' };
    }

    // 충돌 검증 (BoxPhysics 사용)
    const { BoxPhysics } = require('../model/physics');
    if (!BoxPhysics.isPositionAvailable(x, y, z, lenX, lenY, lenZ, boxes, excludeBoxId)) {
      return { isValid: false, message: '다른 박스와 겹칩니다.' };
    }

    return { isValid: true };
  }

  /**
   * 박스 개수 조회
   */
  static getBoxCount(): number {
    return useContainerStore.getState().boxes.size;
  }

  /**
   * 선택된 박스 조회
   */
  static getSelectedBox(): BoxData | null {
    const { selectedBoxId, getBox } = useContainerStore.getState();
    return selectedBoxId ? getBox(selectedBoxId) || null : null;
  }
}
