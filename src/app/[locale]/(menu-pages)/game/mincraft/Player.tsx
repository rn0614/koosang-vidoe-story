"use client"
import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls, Line } from "@react-three/drei"
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier"
import { Axe } from "./Axe"
import { usePlayerStore } from "@/features/game"

const SPEED = 5
const AIR_SPEED = 3.5 // 공중 속도를 높여서 차이를 줄임
const JUMP_FORCE = 8.5
const GROUND_THRESHOLD = 1.2  // Reduced from 1.75 to be more strict
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
const rotation = new THREE.Vector3()

interface PlayerProps {
  lerp?: (start: number, end: number, t: number) => number
}

export function Player({ lerp = THREE.MathUtils.lerp }: PlayerProps) {
  const axe = useRef<THREE.Group>(null)
  const rigidBodyRef = useRef<any>(null)
  const rapier = useRapier()
  const [, get] = useKeyboardControls()
  const { isJumping, setIsJumping, setPosition, setVelocity } = usePlayerStore()
  const debugRayRef = useRef<THREE.Line>(null)
  const [jumpStartVelocity, setJumpStartVelocity] = useState<{x: number, z: number} | null>(null)
  const [jumpTime, setJumpTime] = useState(0)

  useFrame((state, delta) => {
    const { forward, backward, left, right, jump } = get()
    if (!rigidBodyRef.current) return
    const velocity = rigidBodyRef.current.linvel()
    
    // update camera
    const translation = rigidBodyRef.current.translation()
    state.camera.position.set(translation.x, translation.y, translation.z)
    setPosition({ x: translation.x, y: translation.y, z: translation.z })
    
    // update axe
    if (!axe.current) return
    const axeChild = axe.current.children[0]
    if (axeChild) {
      const speed = velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z
      const targetRotation = Math.sin((speed > 1 ? 1 : 0) * state.clock.elapsedTime * 10) / 6
      axeChild.rotation.x = lerp(axeChild.rotation.x, targetRotation, 0.1)
    }
    axe.current.rotation.copy(state.camera.rotation)
    axe.current.position.copy(state.camera.position).add(state.camera.getWorldDirection(rotation).multiplyScalar(1))
    
    // jumping and ground detection
    const world = rapier.world
    const origin = rigidBodyRef.current.translation()
    const ray = world.castRay(
      new RAPIER.Ray(
        { x: origin.x, y: origin.y - 0.5, z: origin.z }, // Start ray from bottom of capsule
        { x: 0, y: -1, z: 0 }
      ),
      GROUND_THRESHOLD,
      true
    )
    
    // Update debug ray visualization
    if (debugRayRef.current) {
      const rayStart = new THREE.Vector3(origin.x, origin.y - 0.5, origin.z)
      const rayEnd = new THREE.Vector3(origin.x, origin.y - 0.5 - GROUND_THRESHOLD, origin.z)
      const positions = new Float32Array([
        rayStart.x, rayStart.y, rayStart.z,
        rayEnd.x, rayEnd.y, rayEnd.z
      ])
      debugRayRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      debugRayRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    const grounded = ray && ray.collider && ray.timeOfImpact <= GROUND_THRESHOLD && Math.abs(velocity.y) < 0.1

    // Check for lateral collisions to detect if player is pushing against a cube
    const horizontal_collisions = [
      world.castRay(new RAPIER.Ray({ x: origin.x, y: origin.y, z: origin.z }, { x: 1, y: 0, z: 0 }), 1, true),
      world.castRay(new RAPIER.Ray({ x: origin.x, y: origin.y, z: origin.z }, { x: -1, y: 0, z: 0 }), 1, true),
      world.castRay(new RAPIER.Ray({ x: origin.x, y: origin.y, z: origin.z }, { x: 0, y: 0, z: 1 }), 1, true),
      world.castRay(new RAPIER.Ray({ x: origin.x, y: origin.y, z: origin.z }, { x: 0, y: 0, z: -1 }), 1, true)
    ];
    
    // movement
    frontVector.set(0, 0, Number(backward) - Number(forward))
    sideVector.set(Number(left) - Number(right), 0, 0)
    direction.subVectors(frontVector, sideVector).normalize()
    
    // 현재 방향키 입력 여부 확인
    const hasMovementInput = frontVector.length() > 0 || sideVector.length() > 0;
    
    // Update jump timer if in air
    if (!grounded && isJumping) {
      setJumpTime(jumpTime + delta);
    }
    
    // 점프 후 일정 시간 동안 지상 속도 유지 (0.3초)
    const useGroundSpeed = grounded || (isJumping && jumpTime < 0.3);
    
    // 방향키를 누르고 있으면 현재 속도 사용, 아니면 점프 시작 속도 활용
    let movementSpeed = useGroundSpeed ? SPEED : AIR_SPEED;
    
    // 방향 설정
    direction.multiplyScalar(movementSpeed).applyEuler(state.camera.rotation);
    
    // Prevent sliding along cube faces when pushing against them in mid-air
    const isCollidingHorizontally = horizontal_collisions.some(ray => ray && ray.collider && ray.timeOfImpact < 0.8);
    
    // If player is pushing against a cube in mid-air, reduce horizontal velocity component
    if (!grounded && isCollidingHorizontally) {
      // Apply reduced air control when pushing against objects
      rigidBodyRef.current.setLinvel({ 
        x: lerp(velocity.x, direction.x, 0.2), 
        y: velocity.y, 
        z: lerp(velocity.z, direction.z, 0.2) 
      }, true);
    } else if (!grounded && !hasMovementInput && jumpStartVelocity) {
      // 공중에서 방향키를 누르지 않으면 점프 시작 속도에서 서서히 감속
      rigidBodyRef.current.setLinvel({
        x: lerp(velocity.x, jumpStartVelocity.x * 0.8, 0.01),
        y: velocity.y,
        z: lerp(velocity.z, jumpStartVelocity.z * 0.8, 0.01)
      }, true);
    } else {
      // Normal movement
      rigidBodyRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);
    }
    
    setVelocity({ x: velocity.x, y: velocity.y, z: velocity.z });

    // Reset jumping state when we hit the ground
    if (grounded && velocity.y <= 0) {
      setIsJumping(false)
      setJumpTime(0)
      setJumpStartVelocity(null)
    }

    // Only allow jumping when grounded and not already jumping
    if (jump && grounded && !isJumping) {
      setIsJumping(true)
      setJumpTime(0)
      // 점프 시작할 때 현재 속도 저장
      setJumpStartVelocity({ x: velocity.x, z: velocity.z })
      rigidBodyRef.current.setLinvel({ 
        x: velocity.x, 
        y: JUMP_FORCE, 
        z: velocity.z 
      }, true)
    }
  })

  const handlePointerMissed = () => {
    if (axe.current?.children[0]) {
      axe.current.children[0].rotation.x = -0.5
    }
  }

  return (
    <>
      <RigidBody 
        ref={rigidBodyRef} 
        colliders={false} 
        mass={1} 
        type="dynamic" 
        position={[0, 10, 0]} 
        enabledRotations={[false, false, false]}
        friction={0.1} // Lower friction to prevent sticking to cube sides
        restitution={0.1} // Add slight bounce for more natural physics
        linearDamping={0.01} // 공중에서 감속 속도 줄임
      >
        <CapsuleCollider args={[0.75, 0.5]} />
      </RigidBody>
      <group ref={axe} onPointerMissed={handlePointerMissed}>
        <Axe position={[0.3, -0.35, 0.5]} />
      </group>
      <primitive object={new THREE.Line(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 'red' })
      )} ref={debugRayRef} />
    </>
  )
}
