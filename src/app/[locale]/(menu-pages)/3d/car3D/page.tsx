'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import {
  COLORS,
  COLORABLE_PARTS,
  ROTATABLE_PARTS,
  WHEEL_ROTATION_DURATION,
} from '@/shared/constants/3dCar';
import { Button } from '@/shared/ui/button';

// interior 애니메이션 컴포넌트
interface InteriorAnimatorProps {
  isDoorOpen: boolean;
  interiorScale: number;
  setInteriorScale: (v: number) => void;
}

const InteriorAnimator: React.FC<InteriorAnimatorProps> = ({
  isDoorOpen,
  interiorScale,
  setInteriorScale,
}) => {
  useFrame((_, delta) => {
    if (isDoorOpen) {
      // sin 함수를 사용하여 1.0 ~ 1.2 사이에서 크기 변화
      const time = performance.now() * 0.003; // 애니메이션 속도 조절
      const scale = 0.95 + 0.05 * Math.sin(time);
      setInteriorScale(scale);
    } else {
      // 문이 닫혀있을 때는 기본 크기로 복원
      setInteriorScale(1.0);
    }
  });
  return null;
};

function renderNode(
  node: THREE.Object3D,
  partColors: Record<string, string>,
  onPartClick: (name: string) => void,
  wheelRotation: number,
  onWheelClick: () => void,
  isDoorOpen: boolean,
  doorAngle: number,
  handleInteriorClick: () => void,
  interiorScale: number = 1.0,
): React.ReactNode {
  const isRenderableMesh = (node as any).geometry && (node as any).material;

  const children = node.children.map((child) =>
    renderNode(
      child,
      partColors,
      onPartClick,
      wheelRotation,
      onWheelClick,
      isDoorOpen,
      doorAngle,
      handleInteriorClick,
      interiorScale,
    ),
  );

  if (isRenderableMesh) {
    const mesh = node as THREE.Mesh;
    // 로그 출력
    console.log('[렌더링 mesh]', {
      name: node.name,
      type: node.type,
      geometry: !!mesh.geometry,
      material: mesh.material,
      children: node.children.length,
    });
    // material 복제(공유 방지)
    let material: THREE.Material | THREE.Material[];
    if (Array.isArray(mesh.material)) {
      material = mesh.material.map((mat) => mat.clone());
      material.forEach((mat: any) => {
        if (
          mat.color &&
          partColors[node.name] &&
          COLORABLE_PARTS.includes(node.name)
        ) {
          mat.color.set(partColors[node.name]);
        }
      });
    } else {
      material = mesh.material.clone();
      if (
        (material as any).color &&
        partColors[node.name] &&
        COLORABLE_PARTS.includes(node.name)
      ) {
        (material as any).color.set(partColors[node.name]);
      }
    }
    const isColorable = COLORABLE_PARTS.includes(node.name);
    const isRotatable = ROTATABLE_PARTS.includes(node.name);
    // 바퀴 회전 적용 (Z축)
    const wheelEuler = isRotatable
      ? new THREE.Euler(0, 0, wheelRotation, 'XYZ')
      : undefined;

    // 도어/인테리어 회전 적용
    let meshRotation = mesh.rotation;
    if (node.name === 'door_l') {
      meshRotation = mesh.rotation.clone();
      meshRotation.y = mesh.rotation.y - doorAngle; // 애니메이션 적용
    } else if (node.name === 'door_r') {
      meshRotation = mesh.rotation.clone();
      meshRotation.y = mesh.rotation.y + doorAngle; // 애니메이션 적용
    } else if (node.name === 'interior') {
      meshRotation = mesh.rotation.clone();
      meshRotation.z = mesh.rotation.z + Math.PI / 2; // +90도(상시)
    }

    // group/mesh 회전값 로그
    if (isRenderableMesh) {
      console.log('[렌더링 mesh]', {
        name: node.name,
        type: node.type,
        rotation: meshRotation,
      });
    } else {
      console.log('[렌더링 group]', {
        name: node.name,
        type: node.type,
        rotation: node.rotation,
      });
    }

    // door_l, door_r는 group으로 감싸서 회전 적용 (자식 포함)
    if (node.name === 'door_l' || node.name === 'door_r') {
      const isLeft = node.name === 'door_l';
      const doorGroupRotation = mesh.rotation.clone();
      doorGroupRotation.y = mesh.rotation.y + (isLeft ? -doorAngle : doorAngle);
      const isColorable = COLORABLE_PARTS.includes(node.name);
      return (
        <group
          key={node.uuid}
          name={node.name}
          position={mesh.position}
          rotation={doorGroupRotation}
          scale={mesh.scale}
        >
          {/* door mesh */}
          <mesh
            geometry={mesh.geometry}
            material={material}
            onClick={
              isColorable
                ? (e) => {
                    e.stopPropagation();
                    onPartClick(node.name);
                  }
                : undefined
            }
            castShadow
            receiveShadow
            name={node.name}
          />
          {/* 자식들 재귀 렌더링 */}
          {node.children.map((child) =>
            renderNode(
              child,
              partColors,
              onPartClick,
              wheelRotation,
              onWheelClick,
              isDoorOpen,
              doorAngle,
              handleInteriorClick,
              interiorScale,
            ),
          )}
        </group>
      );
    }
    // interior는 항상 Z축 90도, Y축은 doorAngle만큼 회전
    if (node.name === 'interior') {
      meshRotation = mesh.rotation.clone();
      meshRotation.z = mesh.rotation.z + Math.PI / 2;
      // 클릭 시 스카이박스 모드로 전환
      return (
        <group
          key={node.uuid}
          name={node.name}
          position={node.position}
          rotation={node.rotation}
          scale={node.scale}
        >
          <mesh
            geometry={mesh.geometry}
            material={material}
            onClick={handleInteriorClick}
            rotation={meshRotation}
            scale={[interiorScale, interiorScale, interiorScale]} // 크기 애니메이션 적용
            castShadow
            receiveShadow
            name={node.name}
          />
          {children}
        </group>
      );
    }

    return (
      <group
        key={node.uuid}
        name={node.name}
        position={node.position}
        rotation={node.rotation}
        scale={node.scale}
      >
        <mesh
          geometry={mesh.geometry}
          material={material}
          onClick={
            isColorable
              ? (e) => {
                  e.stopPropagation();
                  onPartClick(node.name);
                }
              : isRotatable
                ? (e) => {
                    e.stopPropagation();
                    onWheelClick();
                  }
                : undefined
          }
          rotation={isRotatable ? wheelEuler : meshRotation}
          castShadow
          receiveShadow
          name={node.name}
        />
        {children}
      </group>
    );
  } else {
    // group 로그 출력
    console.log('[렌더링 group]', {
      name: node.name,
      type: node.type,
      children: node.children.length,
    });
    // 구조 로그
    console.log('[구조]', {
      name: node.name,
      type: node.type,
      parent: node.parent?.name,
      children: node.children.length,
    });
    return (
      <group
        key={node.uuid}
        name={node.name}
        position={node.position}
        rotation={node.rotation}
        scale={node.scale}
      >
        {children}
      </group>
    );
  }
}

// 바퀴 애니메이션 컴포넌트
interface WheelsAnimatorProps {
  isWheelsRotating: boolean;
  setIsWheelsRotating: (v: boolean) => void;
  wheelRotation: number;
  setWheelRotation: (v: number) => void;
  targetRotation: number;
  animationStartRef: React.MutableRefObject<number | null>;
}

const WheelsAnimator: React.FC<WheelsAnimatorProps> = ({
  isWheelsRotating,
  setIsWheelsRotating,
  wheelRotation,
  setWheelRotation,
  targetRotation,
  animationStartRef,
}) => {
  useFrame(() => {
    if (!isWheelsRotating || animationStartRef.current === null) return;
    const now = performance.now();
    const elapsed = (now - animationStartRef.current) / 1000; // 초
    const start = wheelRotation;
    const end = targetRotation;
    const duration = WHEEL_ROTATION_DURATION;
    if (elapsed >= duration) {
      setWheelRotation(end);
      setIsWheelsRotating(false);
      animationStartRef.current = null;
    } else {
      const t = elapsed / duration;
      setWheelRotation(start + (end - start) * t);
    }
  });
  return null;
};

// 문 애니메이션 컴포넌트
interface DoorAnimatorProps {
  isDoorAnimating: boolean;
  setIsDoorAnimating: (v: boolean) => void;
  doorAngle: number;
  setDoorAngle: (v: number | ((prev: number) => number)) => void;
  targetDoorAngle: number;
  DOOR_ANIMATION_SPEED: number;
}

const DoorAnimator: React.FC<DoorAnimatorProps> = ({
  isDoorAnimating,
  setIsDoorAnimating,
  doorAngle,
  setDoorAngle,
  targetDoorAngle,
  DOOR_ANIMATION_SPEED,
}) => {
  useFrame((_, delta) => {
    if (!isDoorAnimating) return;
    setDoorAngle((prev) => {
      const diff = targetDoorAngle - prev;
      const step =
        Math.sign(diff) *
        Math.min(Math.abs(diff), delta * DOOR_ANIMATION_SPEED);
      const next = prev + step;
      if (Math.abs(targetDoorAngle - next) < 0.01) {
        setIsDoorAnimating(false);
        return targetDoorAngle;
      }
      return next;
    });
  });
  return null;
};

// 카메라 위치 관리를 위한 컴포넌트
const CameraController: React.FC<{
  cameraPosition: THREE.Vector3;
  cameraRotation: THREE.Euler;
  onCameraChange: (position: THREE.Vector3, rotation: THREE.Euler) => void;
}> = ({ cameraPosition, cameraRotation, onCameraChange }) => {
  const { camera } = useThree();

  // 카메라 위치 복원
  React.useEffect(() => {
    camera.position.copy(cameraPosition);
    camera.rotation.copy(cameraRotation);
    camera.updateMatrixWorld();
  }, [camera, cameraPosition, cameraRotation]);

  // 카메라 변경 감지
  useFrame(() => {
    if (
      camera.position.distanceTo(cameraPosition) > 0.01 ||
      camera.rotation.x !== cameraRotation.x ||
      camera.rotation.y !== cameraRotation.y ||
      camera.rotation.z !== cameraRotation.z
    ) {
      onCameraChange(camera.position.clone(), camera.rotation.clone());
    }
  });

  return null;
};

const Car3DPage: React.FC = () => {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  // 부위별 색상 상태
  const [partColors, setPartColors] = useState<Record<string, string>>({});
  // 바퀴 회전 애니메이션 상태
  const [wheelRotation, setWheelRotation] = useState(0); // 모든 바퀴에 동일 적용
  const [targetRotation, setTargetRotation] = useState(0);
  const [isWheelsRotating, setIsWheelsRotating] = useState(false);
  const animationStartRef = React.useRef<number | null>(null);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  // 문 애니메이션 상태
  const [doorAngle, setDoorAngle] = useState(0); // 현재 문 회전값(rad)
  const [targetDoorAngle, setTargetDoorAngle] = useState(0); // 목표 문 회전값(rad)
  const [isDoorAnimating, setIsDoorAnimating] = useState(false);
  const DOOR_OPEN_ANGLE = Math.PI / 2; // 90도
  const DOOR_ANIMATION_SPEED = 2; // rad/sec (조절 가능)
  const [isSkyboxMode, setIsSkyboxMode] = useState(false);

  // 카메라 위치 상태 추가
  const [cameraPosition, setCameraPosition] = useState(
    new THREE.Vector3(0, 1.5, 5),
  );
  const [cameraRotation, setCameraRotation] = useState(
    new THREE.Euler(0, 0, 0),
  );

  // interior 크기 애니메이션 상태 추가
  const [interiorScale, setInteriorScale] = useState(1.0);

  // 카메라 변경 핸들러
  const handleCameraChange = (
    position: THREE.Vector3,
    rotation: THREE.Euler,
  ) => {
    setCameraPosition(position);
    setCameraRotation(rotation);
  };

  // interior 클릭 핸들러
  const handleInteriorClick = () => setIsSkyboxMode(true);

  // 색상 선택
  const handleSelectColor = (idx: number) => {
    setSelectedColorIdx(idx);
  };
  // 부위 클릭 시 해당 부위 색상만 변경
  const handlePartClick = (partName: string) => {
    setPartColors((prev) => ({
      ...prev,
      [partName]: COLORS[selectedColorIdx].value,
    }));
  };
  // 바퀴 클릭 시 네 바퀴 모두 회전 애니메이션 시작
  const handleWheelClick = () => {
    if (isWheelsRotating) return;
    // 5초간 3바퀴(3*2π) 회전
    setTargetRotation((prev) => prev + 3 * 2 * Math.PI);
    setIsWheelsRotating(true);
    animationStartRef.current = performance.now();
  };

  // 문 열기/닫기 버튼 클릭 핸들러
  const handleDoorToggle = () => {
    if (isDoorAnimating) return;
    setIsDoorOpen((prev) => !prev);
    setTargetDoorAngle(isDoorOpen ? 0 : DOOR_OPEN_ANGLE);
    setIsDoorAnimating(true);
  };

  // 스카이박스 모드 분기 렌더링
  if (isSkyboxMode) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#000',
          position: 'relative',
        }}
      >
        <Button onClick={() => setIsSkyboxMode(false)}>돌아가기</Button>
        <Canvas
          camera={{ position: [0, 0, 0.1], fov: 75 }}
          style={{ width: '100vw', height: '100vh' }}
        >
          <Suspense fallback={null}>
            {/* 샘플 스카이박스: public/assets/skybox.hdr 또는 원하는 환경맵 경로로 변경 가능 */}
            <Environment files="/assets/road_scene_true.hdr" background />
          </Suspense>
        </Canvas>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', background: '#222' }}>
      {/* 상단 색상 선택 버튼 */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: 16,
        }}
      >
        {COLORS.map((c, idx) => (
          <Button
            variant={selectedColorIdx === idx ? 'default' : 'outline'}
            key={c.value}
            onClick={() => handleSelectColor(idx)}
          >
            {c.name}
          </Button>
        ))}

        <Button onClick={handleDoorToggle} disabled={isDoorAnimating}>
          {isDoorOpen ? '문 닫기' : '문 열기'}
        </Button>
      </div>
      {/* 문 열기/닫기 토글 버튼 */}
      <Canvas
        camera={{
          position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
          fov: 50,
        }}
        shadows
      >
        <CameraController
          cameraPosition={cameraPosition}
          cameraRotation={cameraRotation}
          onCameraChange={handleCameraChange}
        />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 7.5]} intensity={1.2} castShadow />
        <Suspense fallback={null}>
          <Environment preset="city" />
          {/* 문 애니메이션 핸들러 */}
          <DoorAnimator
            isDoorAnimating={isDoorAnimating}
            setIsDoorAnimating={setIsDoorAnimating}
            doorAngle={doorAngle}
            setDoorAngle={setDoorAngle}
            targetDoorAngle={targetDoorAngle}
            DOOR_ANIMATION_SPEED={DOOR_ANIMATION_SPEED}
          />
          {/* 바퀴 애니메이션 핸들러 */}
          <WheelsAnimator
            isWheelsRotating={isWheelsRotating}
            setIsWheelsRotating={setIsWheelsRotating}
            wheelRotation={wheelRotation}
            setWheelRotation={setWheelRotation}
            targetRotation={targetRotation}
            animationStartRef={animationStartRef}
          />
          {/* interior 애니메이션 핸들러 */}
          <InteriorAnimator
            isDoorOpen={isDoorOpen}
            interiorScale={interiorScale}
            setInteriorScale={setInteriorScale}
          />
          {renderNode(
            useGLTF('/assets/free_car_001.glb').scene,
            partColors,
            handlePartClick,
            wheelRotation,
            handleWheelClick,
            isDoorOpen,
            doorAngle,
            handleInteriorClick,
            interiorScale,
          )}
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
    </div>
  );
};

export default Car3DPage;

useGLTF.preload('/assets/free_car_001.glb');
