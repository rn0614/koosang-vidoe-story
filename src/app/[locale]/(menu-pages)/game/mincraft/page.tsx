"use client"
import { Canvas } from "@react-three/fiber"
import { Sky, PointerLockControls, KeyboardControls, Environment } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import { Ground } from "./Ground"
import { Player } from "./Player"
import { Cube, Cubes } from "./Cube"

// The original was made by Maksim Ivanow: https://www.youtube.com/watch?v=Lc2JvBXMesY&t=124s
// This demo needs pointer-lock, that works only if you open it in a new window
// Controls: WASD + left click

export default function MincraftPage() {
  return (
    <div className="w-screen h-[calc(100vh-4rem)] fixed left-0 top-16 z-0"> {/* 4rem은 헤더 높이 예시 */}
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
          { name: "left", keys: ["ArrowLeft", "a", "A"] },
          { name: "right", keys: ["ArrowRight", "d", "D"] },
          { name: "jump", keys: ["Space"] },
        ]}>
        <Canvas
          shadows
          camera={{ fov: 45 }}
          className="w-full h-full"
        >
          <fog attach="fog" args={["#87CEEB", 10, 40]} />
          <color attach="background" args={["#87CEEB"]} /> {/* Light blue sky color */}
          <Sky 
            sunPosition={[100, 50, 100]} 
            turbidity={0.5}
            rayleigh={0.5}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
          />
          {/* Increased ambient light for overall brightness */}
          <ambientLight intensity={0.8} color="#FFFFFF" />
          
          {/* Main directional sun light with shadows */}
          <directionalLight
            castShadow
            intensity={1.5}
            position={[100, 100, 100]}
            shadow-mapSize={[2048, 2048]}
            shadow-camera-far={500}
            shadow-camera-left={-100}
            shadow-camera-right={100}
            shadow-camera-top={100}
            shadow-camera-bottom={-100}
            color="#FFF5E0"
          />
          
          {/* Secondary fill light from opposite direction */}
          <directionalLight 
            intensity={0.6} 
            position={[-50, 80, -50]} 
            color="#E0F5FF" 
          />
          
          {/* Ground-level ambient light to brighten dark areas */}
          <hemisphereLight 
            intensity={0.7} 
            color="#FFE8CC" 
            groundColor="#75B5E3" 
          />

          <Physics gravity={[0, -30, 0]}>
            <Ground />
            <Player />
            <Cube position={[0, 0.5, -10]} />
            <Cubes />
          </Physics>
          <PointerLockControls />

          {/* Add soft environment map for realistic reflections */}
          <Environment preset="sunset" />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}
