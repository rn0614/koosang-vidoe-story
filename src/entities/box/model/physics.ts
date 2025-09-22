import { BoxData, BoxBounds, StabilityInfo, SupportingBox } from '../types';

/**
 * 박스 물리 계산 유틸리티 클래스
 * 충돌 검사, 안정성 검사, 위치 유효성 검사 등 물리 관련 계산을 담당
 */
export class BoxPhysics {
  /**
   * 박스의 바운딩 박스 계산
   */
  static calculateBounds(box: BoxData): BoxBounds {
    return {
      minX: box.x - box.lenX,
      maxX: box.x,
      minY: box.y - box.lenY,
      maxY: box.y,
      minZ: box.z - box.lenZ,
      maxZ: box.z
    };
  }

  /**
   * 박스의 중심점 계산
   */
  static calculateCenter(box: BoxData): { x: number; y: number; z: number } {
    return {
      x: box.x - box.lenX / 2,
      y: box.y - box.lenY / 2,
      z: box.z - box.lenZ / 2
    };
  }

  /**
   * 두 박스 간의 충돌 검사
   */
  static checkCollision(box1: BoxData, box2: BoxData): boolean {
    const bounds1 = this.calculateBounds(box1);
    const bounds2 = this.calculateBounds(box2);

    return (
      bounds1.maxX > bounds2.minX && bounds1.minX < bounds2.maxX &&
      bounds1.maxY > bounds2.minY && bounds1.minY < bounds2.maxY &&
      bounds1.maxZ > bounds2.minZ && bounds1.minZ < bounds2.maxZ
    );
  }

  /**
   * 위치가 다른 박스들과 충돌하는지 검사
   */
  static isPositionAvailable(
    x: number,
    y: number,
    z: number,
    lenX: number,
    lenY: number,
    lenZ: number,
    boxes: Map<string, BoxData>,
    excludeBoxId?: string
  ): boolean {
    const testBox = { x, y, z, lenX, lenY, lenZ } as BoxData;
    
    for (const [boxId, existingBox] of Array.from(boxes.entries())) {
      if (excludeBoxId && boxId === excludeBoxId) continue;
      
      if (this.checkCollision(testBox, existingBox)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 가장 가까운 사용 가능한 위치 찾기
   */
  static findNearestAvailablePosition(
    targetX: number,
    targetY: number,
    targetZ: number,
    lenX: number,
    lenY: number,
    lenZ: number,
    boxes: Map<string, BoxData>,
    excludeBoxId?: string
  ): { x: number; y: number; z: number } {
    // 현재는 기본 구현, 나중에 더 정교한 알고리즘으로 개선 가능
    if (this.isPositionAvailable(targetX, targetY, targetZ, lenX, lenY, lenZ, boxes, excludeBoxId)) {
      return { x: targetX, y: targetY, z: targetZ };
    }
    
    // 간단한 탐색: Y축으로 올리기
    for (let y = targetY; y <= 50; y += 2) {
      if (this.isPositionAvailable(targetX, y, targetZ, lenX, lenY, lenZ, boxes, excludeBoxId)) {
        return { x: targetX, y, z: targetZ };
      }
    }
    
    return { x: targetX, y: targetY, z: targetZ };
  }

  /**
   * 박스의 안정성 검사
   */
  static checkBoxStability(
    x: number,
    y: number,
    z: number,
    lenX: number,
    lenY: number,
    lenZ: number,
    boxes: Map<string, BoxData>,
    excludeBoxId?: string
  ): StabilityInfo {
    const centerX = x - lenX / 2;
    const centerZ = z - lenZ / 2;
    const bottomY = y - lenY;
    const supportingBoxes: SupportingBox[] = [];
    let isCenterSupported = false;

    // 바닥에 닿아있으면 안정
    if (bottomY <= 0) {
      return {
        isStable: true,
        reason: 'ground',
        supportingBoxes,
        centerX,
        centerZ,
        centerSupported: true
      };
    }

    // 다른 박스들과의 지지 관계 검사
    for (const [boxId, existingBox] of Array.from(boxes.entries())) {
      if (excludeBoxId && boxId === excludeBoxId) continue;

      const bounds = this.calculateBounds(existingBox);
      
      // 바닥면이 다른 박스의 윗면과 거의 일치하는지 확인
      if (Math.abs(bottomY - bounds.maxY) < 0.1) {
        const isXInside = centerX > bounds.minX && centerX < bounds.maxX;
        const isZInside = centerZ > bounds.minZ && centerZ < bounds.maxZ;
        
        if (isXInside && isZInside) {
          isCenterSupported = true;
          supportingBoxes.push({ id: boxId, centerSupported: true });
        } else {
          supportingBoxes.push({ id: boxId, centerSupported: false });
        }
      }
    }

    return {
      isStable: isCenterSupported,
      reason: isCenterSupported ? 'center_supported' : 'center_unsupported',
      supportingBoxes,
      centerX,
      centerZ,
      centerSupported: isCenterSupported
    };
  }

  /**
   * 특정 X, Z 위치에서 최소 Y 위치 찾기
   */
  static findMinimumYPosition(
    x: number,
    z: number,
    lenX: number,
    lenY: number,
    lenZ: number,
    boxes: Map<string, BoxData>,
    excludeBoxId?: string
  ): number {
    for (let testY = lenY; testY <= 50; testY++) {
      if (this.isPositionAvailable(x, testY, z, lenX, lenY, lenZ, boxes, excludeBoxId)) {
        return testY;
      }
    }
    return lenY;
  }
}
