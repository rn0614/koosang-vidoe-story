import React from 'react';
import { Box } from '@react-three/drei';
import { useBoxesStore } from '@/features/3d-visualization';

const OccupiedAreaIndicator: React.FC = () => {
  const { getAllBoxIds, getBox } = useBoxesStore();
  return (
    <group>
      {getAllBoxIds().map((boxId) => {
        const boxData = getBox(boxId);
        if (!boxData) return null;
        const centerX = boxData.x - boxData.lenX / 2;
        const centerY = 0.05;
        const centerZ = boxData.z - boxData.lenZ / 2;
        return (
          <Box
            key={boxId}
            position={[centerX, centerY, centerZ]}
            args={[boxData.lenX, 0.1, boxData.lenZ]}
          >
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.2} />
          </Box>
        );
      })}
    </group>
  );
};

export default OccupiedAreaIndicator; 