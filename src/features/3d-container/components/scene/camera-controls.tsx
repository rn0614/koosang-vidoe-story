import React from 'react';
import { OrbitControls } from '@react-three/drei';

/**
 * 3D 카메라 컨트롤
 * 마우스/터치로 3D 뷰 조작 가능
 */
const CameraControls: React.FC = () => {
  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.1}
      enableZoom={true}
      enablePan={true}
      enableRotate={true}
      maxPolarAngle={Math.PI / 2}
      minDistance={5}
      maxDistance={100}
      target={[0, 5, 0]}
    />
  );
};

export default CameraControls;

