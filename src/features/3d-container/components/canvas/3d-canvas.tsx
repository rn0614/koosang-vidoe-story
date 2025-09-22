import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useContainerStore } from '@/entities/container';
import {
  Lighting,
  GridFloor,
  CameraControls,
  ConveyorBelt,
} from '@/features/3d-container';
import AnimatedBox from '@/features/3d-container/components/objects/animated-box-legacy';

interface ThreeCanvasProps {
  onSelectBox: (boxId: string) => void;
}

/**
 * 3D Canvas 컴포넌트
 * 박스 렌더링과 3D 씬 관리를 담당
 */
const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onSelectBox }) => {
  // ContainerStore에서 박스 개수와 컨테이너 ID 구독하여 렌더링 최적화
  const boxCount = useContainerStore((state) => state.boxes.size);
  const currentContainerId = useContainerStore((state) => state.currentContainer?.id);
  
  // boxIds는 박스 개수 또는 컨테이너 변경시에만 재계산
  const boxIds = useMemo(() => {
    if (!currentContainerId || boxCount === 0) {
      console.log('🎨 ThreeCanvas: 박스 없음, 빈 배열 반환');
      return [];
    }
    console.log('🎨 ThreeCanvas: boxIds 재계산');
    return useContainerStore.getState().getAllBoxIds();
  }, [boxCount, currentContainerId]);

  console.log('🎨 ThreeCanvas 렌더링, 박스 개수:', boxCount, 'boxIds:', boxIds.length);

  return (
    <Canvas
      camera={{ position: [20, 15, 20], fov: 75 }}
      style={{
        width: '100vw',
        height: '100dvh',
        background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        touchAction: 'none',
      }}
    >
      {/* Scene Components */}
      <Lighting />
      <GridFloor />
      <ConveyorBelt />

      {/* 🚀 최적화된 박스 렌더링: 각 박스는 독립적으로 리렌더링 */}
      {currentContainerId && boxIds.length > 0 && boxIds.map((boxId) => (
        <AnimatedBox 
          key={boxId} 
          boxId={boxId} 
          onSelect={onSelectBox} 
        />
      ))}

      <CameraControls />
    </Canvas>
  );
};

export default React.memo(ThreeCanvas);
