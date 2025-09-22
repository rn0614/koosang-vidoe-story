import React from 'react';
import { Plane } from '@react-three/drei';

/**
 * 3D 씬의 격자 바닥
 * 공간감과 참조점을 제공하는 격자무늬 바닥
 */
const GridFloor: React.FC = () => {
  return (
    <>
      {/* 메인 바닥 평면 */}
      <Plane
        args={[100, 100]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial 
          color="#f0f0f0" 
          transparent 
          opacity={0.8}
        />
      </Plane>
      
      {/* 격자 라인들 */}
      <gridHelper 
        args={[100, 50, '#cccccc', '#eeeeee']} 
        position={[0, 0.01, 0]} 
      />
    </>
  );
};

export default GridFloor;

