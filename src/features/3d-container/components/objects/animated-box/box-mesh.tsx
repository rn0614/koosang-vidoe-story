import React, { forwardRef } from 'react';
import { Box, Text } from '@react-three/drei';
import { Mesh } from 'three';
import { BoxData, StabilityInfo } from '@/entities/box';

interface BoxMeshProps {
  boxData: BoxData;
  isSelected: boolean;
  stabilityInfo: StabilityInfo | null;
  movementPhase: string;
  isSequentialMoving: boolean;
  onBoxClick: (e: any) => void;
}

/**
 * 3D 박스 메쉬를 렌더링하는 컴포넌트
 * 순수한 렌더링 로직만 담당
 */
const BoxMesh = forwardRef<Mesh, BoxMeshProps>(({
  boxData,
  isSelected,
  stabilityInfo,
  movementPhase,
  isSequentialMoving,
  onBoxClick
}, ref) => {
  // 박스 중심 좌표 계산
  const centerX = boxData.x - boxData.lenX / 2;
  const centerY = boxData.y - boxData.lenY / 2;
  const centerZ = boxData.z - boxData.lenZ / 2;

  // 색상 계산
  const getBoxColor = (): string => {
    if (isSelected) return '#ff4444';
    if (isSequentialMoving) {
      switch (movementPhase) {
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

  // 상태 텍스트 계산
  const getStatusText = (): string => {
    if (!isSequentialMoving) return boxData.id;
    switch (movementPhase) {
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

  return (
    <group>
      <Box
        ref={ref}
        position={[centerX, centerY, centerZ]}
        args={[boxData.lenX, boxData.lenY, boxData.lenZ]}
        onClick={onBoxClick}
      >
        <meshStandardMaterial
          color={getBoxColor()}
          transparent
          opacity={isSelected ? 0.8 : 0.7}
        />
      </Box>
      
      {/* 박스 ID 텍스트 */}
      <Text
        position={[centerX, centerY + boxData.lenY / 2 + 0.5, centerZ]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {getStatusText()}
      </Text>
      
      {/* 원점 표시 */}
      <Box position={[0, 0, 0]} args={[0.2, 0.2, 0.2]}>
        <meshBasicMaterial color="#00ff00" />
      </Box>
      
      {/* 안정성 표시 */}
      {stabilityInfo && !isSequentialMoving && (
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
});

BoxMesh.displayName = 'BoxMesh';

export default BoxMesh;
