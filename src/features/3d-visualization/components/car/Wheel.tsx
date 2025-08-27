import React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface WheelProps {
  geometry: THREE.BufferGeometry
  material: THREE.Material | THREE.Material[]
  position: THREE.Vector3 | [number, number, number]
  rotation?: THREE.Euler
  scale: THREE.Vector3 | [number, number, number]
  name: string
  onClick?: (e: any) => void
  wheelRotation: number
  isRotating: boolean
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
  const meshRef = React.useRef<THREE.Mesh>(null)

  // 애니메이션: 회전값을 직접 적용
  useFrame(() => {
    if (meshRef.current) {
      // Z축 회전
      meshRef.current.rotation.z = wheelRotation
    }
  })

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
  )
}
