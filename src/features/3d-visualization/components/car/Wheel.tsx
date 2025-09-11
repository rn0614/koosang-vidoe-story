import React from 'react';
import { Mesh, Vector3, Euler, BufferGeometry, Material } from 'three';
import { useFrame } from '@react-three/fiber';

interface WheelProps {
  geometry: BufferGeometry;
  material: Material | Material[];
  position: Vector3 | [number, number, number];
  rotation?: Euler;
  scale: Vector3 | [number, number, number];
  name: string;
  onClick?: (e: any) => void;
  wheelRotation: number;
  isRotating: boolean;
}

export const Wheel: React.FC<WheelProps> = ({
  geometry,
  material,
  position,
  rotation,
  scale,
  name,
  onClick,
  wheelRotation,
  isRotating,
}) => {
  const meshRef = React.useRef<Mesh>(null);

  // 애니메이션: 회전값을 직접 적용
  useFrame(() => {
    if (meshRef.current) {
      // Z축 회전
      meshRef.current.rotation.z = wheelRotation;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scale}
      name={name}
      onClick={onClick}
      castShadow
      receiveShadow
    />
  );
};
