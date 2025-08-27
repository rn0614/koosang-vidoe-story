import React from 'react';
import { Box, Text } from '@react-three/drei';

const ConveyorBelt: React.FC = () => {
  return (
    <group position={[0, 15, 0]}>
      <Box args={[20, 0.5, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#666666" />
      </Box>
      <Text
        position={[0, 1, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        CONVEYOR BELT
      </Text>
      {[-6, -3, 0, 3, 6].map((x, i) => (
        <Text
          key={i}
          position={[x, 0.3, 0]}
          fontSize={1}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          ↑
        </Text>
      ))}
    </group>
  );
};

export default ConveyorBelt; 