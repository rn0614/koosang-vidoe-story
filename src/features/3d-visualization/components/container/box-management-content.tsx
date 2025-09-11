import React, { useCallback, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { ScrollArea } from '@/shared/ui/scroll-area';
import {
  Move3D,
  Plus,
} from 'lucide-react';
import { useBoxesStore } from '@/features/3d-visualization';
import AnimatedBox from '@/features/3d-visualization/components/container/animated-box';
import OccupiedAreaIndicator from '@/features/3d-visualization/components/container/occupied-area-indicator';
import ConveyorBelt from '@/features/3d-visualization/components/container/conveyor-belt';
import GridFloor from '@/features/3d-visualization/components/container/grid-floor';
import Lighting from '@/features/3d-visualization/components/container/lighting';
import BoxInfoCard from '@/features/3d-visualization/components/container/boxInfo-card';
import SelectedBoxDisplay from '@/features/3d-visualization/components/container/selected-box-display';
import { BoxData, BoxMethods } from '@/shared/types/boxPosition';
import { useIsMobile } from '@/shared/hooks/useIsMobile';

const BoxManagementContent: React.FC = () => {
  console.log('📱 BoxManagementContent 렌더링');
  const [nextBoxId, setNextBoxId] = useState<number>(10);

  // 🎯 박스 개수만 구독 (새 박스 추가/삭제시에만 변경)
  const boxCount = useBoxesStore((state) => state.boxes.size);

  // 🎯 boxIds는 박스 개수 변경시에만 재계산 (성능 최적화)
  const boxIds = useMemo(() => {
    console.log('📋 boxIds 재계산');
    return useBoxesStore.getState().getAllBoxIds();
  }, [boxCount]);

  const handleSelectBox = useCallback((boxId: string) => {
    console.log(`🎯 박스 선택: ${boxId}`);
    useBoxesStore.getState().setSelectedBoxId(boxId);
  }, []);

  const handleMoveToConveyor = useCallback((boxId: string): void => {
    const ref = useBoxesStore.getState().getBoxRef(boxId);
    if (ref && ref.current) {
      console.log(`⬆️ ${boxId} 컨베이어로 이동`);
      ref.current.moveToConveyor();
    }
  }, []);

  const handleDropToBottom = useCallback((boxId: string): void => {
    const ref = useBoxesStore.getState().getBoxRef(boxId);
    if (ref && ref.current) {
      console.log(`⬇️ ${boxId} 바닥으로 이동`);
      ref.current.dropToBottom();
    }
  }, []);

  const handleMoveToOtherPosition = useCallback(
    async (boxId: string, x: number, z: number): Promise<void> => {
      const ref = useBoxesStore.getState().getBoxRef(boxId);
      if (ref && ref.current) {
        try {
          console.log(`🚚 ${boxId} 시퀀셜 이동 시작: (${x}, ${z})`);
          await ref.current.moveToOtherPosition(x, z);
          console.log(`✅ ${boxId} 시퀀셜 이동 완료`);
        } catch (error) {
          console.error(`❌ ${boxId} 이동 실패:`, error);
        }
      }
    },
    [],
  );

  const generateRandomColor = useCallback((): string => {
    const colors = [
      '#4299e1',
      '#48bb78',
      '#ed8936',
      '#9f7aea',
      '#f56565',
      '#38b2ac',
      '#d69e2e',
      '#e53e3e',
      '#805ad5',
      '#667eea',
      '#f093fb',
      '#4facfe',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const handleAddBox = useCallback((): void => {
    const newBoxId = `BOX-${String(nextBoxId).padStart(3, '0')}`;
    const conveyorY = 15;

    console.log(`➕ 새 박스 추가: ${newBoxId}`);

    const { findNearestAvailablePosition, addBox } = useBoxesStore.getState();
    const conveyorPosition = findNearestAvailablePosition(
      0,
      conveyorY,
      0,
      2,
      2,
      2,
    );

    const newBox: BoxData = {
      id: newBoxId,
      x: conveyorPosition.x,
      y: conveyorPosition.y,
      z: conveyorPosition.z,
      lenX: 2,
      lenY: 2,
      lenZ: 2,
      color: generateRandomColor(),
      ref: React.createRef<BoxMethods>(),
    };

    addBox(newBox);
    setNextBoxId((prev) => prev + 1);
  }, [nextBoxId, generateRandomColor]);

  const handleCanvasClick = useCallback((): void => {
    // 🚀 selectedBoxId 구독하지 않으므로 getState()로 현재 값 확인
    const currentSelectedBoxId = useBoxesStore.getState().selectedBoxId;
    if (currentSelectedBoxId) {
      console.log('🚫 박스 선택 해제');
      useBoxesStore.getState().setSelectedBoxId(null);
    }
  }, []);

  // 🚀 핸들러들을 완전히 안정적으로 만들기 (의존성 최소화)
  const stableHandlers = useMemo(
    () => ({
      onSelect: handleSelectBox,
      onMoveToConveyor: handleMoveToConveyor,
      onDropToBottom: handleDropToBottom,
      onMoveToOtherPosition: handleMoveToOtherPosition,
    }),
    [],
  ); // 🎯 빈 의존성 배열로 완전히 고정

  const isMobile = useIsMobile();

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [20, 15, 20], fov: 75 }}
        style={{
          width: '100vw',
          height: '100dvh',
          background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
          touchAction: 'none',
        }}
      >
        <Lighting />
        <GridFloor />
        <OccupiedAreaIndicator />
        <ConveyorBelt />

        {/* 🚀 최적화된 박스 렌더링: 각 박스는 독립적으로 리렌더링 */}
        {boxIds.map((boxId) => (
          <AnimatedBox key={boxId} boxId={boxId} onSelect={handleSelectBox} />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>

      {/* 🎨 UI 패널 */}
      <Card className="absolute bottom-4 right-4 w-80 bg-background/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Move3D className="h-5 w-5" />
            박스 관리 시스템
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">박스 목록</span>
            <Button
              size="sm"
              onClick={handleAddBox}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              추가
            </Button>
          </div>
          {/* 🚀 선택된 박스 표시를 별도 컴포넌트로 분리 */}
          <SelectedBoxDisplay />
          <ScrollArea className={isMobile ? 'h-auto' : 'h-80'}>
            <div className="space-y-2">
              {/* 🚀 최적화된 렌더링: 각 BoxInfoCard는 독립적으로 리렌더링 */}
              {boxIds.map((boxId) => (
                <BoxInfoCard
                  key={boxId}
                  boxId={boxId}
                  onSelect={stableHandlers.onSelect}
                  onMoveToConveyor={stableHandlers.onMoveToConveyor}
                  onDropToBottom={stableHandlers.onDropToBottom}
                  onMoveToOtherPosition={stableHandlers.onMoveToOtherPosition}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoxManagementContent;
