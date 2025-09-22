import React from 'react';
import { Box } from '@react-three/drei';

/**
 * 컨베이어 벨트 3D 모델
 * 박스들이 이동할 수 있는 컨베이어 벨트 시각화
 */
const ConveyorBelt: React.FC = () => {
  return (
    <group position={[0, 15, 0]}>
      {/* 컨베이어 벨트 플랫폼 */}
      <Box args={[20, 0.5, 4]} castShadow receiveShadow>
        <meshStandardMaterial color="#404040" />
      </Box>
      
      {/* 컨베이어 벨트 측면 가이드 */}
      <Box args={[20, 1, 0.2]} position={[0, 0.75, 2]} castShadow>
        <meshStandardMaterial color="#606060" />
      </Box>
      <Box args={[20, 1, 0.2]} position={[0, 0.75, -2]} castShadow>
        <meshStandardMaterial color="#606060" />
      </Box>
      
      {/* 컨베이어 벨트 표면 무늬 */}
      {Array.from({ length: 10 }, (_, i) => (
        <Box 
          key={i}
          args={[1.8, 0.05, 3.8]} 
          position={[-9 + i * 2, 0.3, 0]}
        >
          <meshStandardMaterial color="#505050" />
        </Box>
      ))}
    </group>
  );
};

export default ConveyorBelt;

