import { useCallback, useRef, useState } from "react"
import { useTexture } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"
import { create } from "zustand"

// This is a naive implementation and wouldn't allow for more than a few thousand boxes.
// In order to make this scale this has to be one instanced mesh, then it could easily be
// hundreds of thousands.

interface CubeState {
  cubes: [number, number, number][]
  addCube: (x: number, y: number, z: number) => void
}

const useCubeStore = create<CubeState>((set) => ({
  cubes: [],
  addCube: (x: number, y: number, z: number) => set((state) => ({ cubes: [...state.cubes, [x, y, z]] })),
}))

export const Cubes = () => {
  const cubes = useCubeStore((state) => state.cubes)
  return cubes.map((coords, index) => <Cube key={index} position={coords} />)
}

interface CubeProps {
  position: [number, number, number]
}

export function Cube(props: CubeProps) {
  const ref = useRef<any>(null)
  const [hover, set] = useState<number | null>(null)
  const addCube = useCubeStore((state) => state.addCube)
  const texture = useTexture("/assets/dirt.jpg")
  const onMove = useCallback((e: any) => {
    e.stopPropagation()
    set(Math.floor(e.faceIndex / 2))
  }, [])
  const onOut = useCallback(() => set(null), [])
  const onClick = useCallback((e: any) => {
    e.stopPropagation()
    const { x, y, z } = ref.current.translation()
    const dir = [
      [x + 1, y, z],
      [x - 1, y, z],
      [x, y + 1, z],
      [x, y - 1, z],
      [x, y, z + 1],
      [x, y, z - 1],
    ] as const
    const [newX, newY, newZ] = dir[Math.floor(e.faceIndex / 2)]
    addCube(newX, newY, newZ)
  }, [])
  return (
    <RigidBody 
      {...props} 
      type="fixed" 
      colliders="cuboid" 
      ref={ref} 
      friction={0.2} 
      restitution={0}
    >
      <mesh receiveShadow castShadow onPointerMove={onMove} onPointerOut={onOut} onClick={onClick}>
        {[...Array(6)].map((_, index) => (
          <meshStandardMaterial attach={`material-${index}`} key={index} map={texture} color={hover === index ? "hotpink" : "white"} />
        ))}
        <boxGeometry />
      </mesh>
    </RigidBody>
  )
}
