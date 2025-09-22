import React from 'react';

/**
 * 3D 씬 조명 설정
 * 환경광과 방향성 조명을 통해 자연스러운 3D 환경 조성
 */
const Lighting: React.FC = () => {
  return (
    <>
      {/* 환경광 (전체적인 밝기) */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* 주 방향성 조명 (그림자 생성) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* 보조 조명 (부드러운 채우기) */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.4}
        color="#b3d9ff"
      />
      
      {/* 포인트 라이트 (국소 조명) */}
      <pointLight
        position={[0, 15, 0]}
        intensity={0.5}
        color="#fff8dc"
        distance={30}
        decay={2}
      />
    </>
  );
};

export default Lighting;

