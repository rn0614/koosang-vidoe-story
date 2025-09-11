import { RepeatWrapping, SRGBColorSpace } from 'three';
import { useTexture } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

interface GroundProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

// Preload the texture
useTexture.preload('/assets/grass.jpg');

export function Ground(props: GroundProps) {
  const texture = useTexture('/assets/grass.jpg');
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  return (
    <RigidBody {...props} type="fixed" colliders={false}>
      <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial
          map={texture}
          map-repeat={[240, 240]}
          color="white"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <CuboidCollider args={[1000, 2, 1000]} position={[0, -2, 0]} />
    </RigidBody>
  );
}
