import React, { useCallback, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle,
  Move3D,
  Camera,
  RotateCcw,
  ZoomIn,
  Hand,
  Plus,
  Navigation,
} from 'lucide-react';
import { useBoxesStore } from '../../store/useBoxesStore';
import AnimatedBox from '@/components/box3d/animated-box';
import OccupiedAreaIndicator from '@/components/box3d/occupied-area-indicator';
import ConveyorBelt from '@/components/box3d/conveyor-belt';
import GridFloor from '@/components/box3d/grid-floor';
import Lighting from '@/components/box3d/lighting';
import BoxInfoCard from '@/components/box3d/boxInfo-card';
import SelectedBoxDisplay from '@/components/box3d/selected-box-display';
import BoxStatusDisplay from '@/components/box3d/box-status-display';
import { BoxData, BoxMethods } from '@/types/boxPosition';

const BoxManagementContent: React.FC = () => {
  console.log('📱 BoxManagementContent 렌더링');
  const [nextBoxId, setNextBoxId] = useState<number>(10);

  // 🎯 박스 개수만 구독 (새 박스 추가/삭제시에만 변경)
  const boxCount = useBoxesStore(state => state.boxes.size);
  
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

  const handleMoveToOtherPosition = useCallback(async (
    boxId: string,
    x: number,
    z: number,
  ): Promise<void> => {
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
  }, []);

  const generateRandomColor = useCallback((): string => {
    const colors = [
      '#4299e1', '#48bb78', '#ed8936', '#9f7aea', 
      '#f56565', '#38b2ac', '#d69e2e', '#e53e3e', 
      '#805ad5', '#667eea', '#f093fb', '#4facfe',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  const handleAddBox = useCallback((): void => {
    const newBoxId = `BOX-${String(nextBoxId).padStart(3, '0')}`;
    const conveyorY = 15;
    
    console.log(`➕ 새 박스 추가: ${newBoxId}`);
    
    const { findNearestAvailablePosition, addBox } = useBoxesStore.getState();
    const conveyorPosition = findNearestAvailablePosition(0, conveyorY, 0, 2, 2, 2);
    
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

  const handleMoveMultipleBoxes = useCallback(async (): Promise<void> => {
    try {
      console.log('🚛 다중 박스 이동 시작');
      
      // 병렬이 아닌 순차 실행으로 충돌 방지
      await handleMoveToOtherPosition('BOX-001', 10, 2);
      await new Promise(resolve => setTimeout(resolve, 500)); // 딜레이 추가
      
      await handleMoveToOtherPosition('BOX-002', 12, 2);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await handleMoveToOtherPosition('BOX-003', 14, 2);
      
      console.log('✅ 다중 박스 이동 완료');
    } catch (error) {
      console.error('❌ 다중 박스 이동 실패:', error);
    }
  }, [handleMoveToOtherPosition]);

  // 🚀 핸들러들을 완전히 안정적으로 만들기 (의존성 최소화)
  const stableHandlers = useMemo(() => ({
    onSelect: handleSelectBox,
    onMoveToConveyor: handleMoveToConveyor,
    onDropToBottom: handleDropToBottom,
    onMoveToOtherPosition: handleMoveToOtherPosition,
  }), []); // 🎯 빈 의존성 배열로 완전히 고정

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [20, 15, 20], fov: 75 }}
        style={{
          background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        }}
        onClick={handleCanvasClick}
      >
        <Lighting />
        <GridFloor />
        <OccupiedAreaIndicator />
        <ConveyorBelt />
        
        {/* 🚀 최적화된 박스 렌더링: 각 박스는 독립적으로 리렌더링 */}
        {boxIds.map((boxId) => (
          <AnimatedBox
            key={boxId}
            boxId={boxId}
            onSelect={handleSelectBox}
          />
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
      <Card className="absolute left-4 top-4 w-80 bg-background/95 shadow-xl backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Move3D className="h-5 w-5" />
            박스 관리 시스템 (최적화됨)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="boxes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="boxes">박스 목록</TabsTrigger>
              <TabsTrigger value="controls">시스템</TabsTrigger>
            </TabsList>
            
            <TabsContent value="boxes" className="mt-4 space-y-3">
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
              
              <ScrollArea className="h-80">
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
            </TabsContent>
            
            <TabsContent value="controls" className="mt-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="mb-2 font-semibold">박스 조작</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={handleAddBox}
                      className="flex w-full items-center gap-2"
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />새 박스 추가
                    </Button>
                    <Button
                      onClick={handleMoveMultipleBoxes}
                      className="flex w-full items-center gap-2"
                      size="sm"
                      variant="outline"
                    >
                      <Navigation className="h-4 w-4" />
                      다중 박스 이동 테스트
                    </Button>
                    <Button
                      onClick={() => {
                        const firstBoxId = boxIds[0];
                        if (firstBoxId) {
                          const ref = useBoxesStore.getState().getBoxRef(firstBoxId);
                          if (ref && ref.current) {
                            console.log(`🔧 ${firstBoxId} 테스트 이동`);
                            ref.current.moveToPosition(10, 5, 10);
                          }
                        }
                      }}
                      className="flex w-full items-center gap-2"
                      size="sm"
                      variant="secondary"
                    >
                      🔧 첫 박스 테스트 이동
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      새 박스는 컨베이어 위에 생성됩니다
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-semibold">
                    <Camera className="h-4 w-4" />
                    카메라 조작
                  </h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-3 w-3" />
                      좌클릭 + 드래그: 회전
                    </div>
                    <div className="flex items-center gap-2">
                      <Hand className="h-3 w-3" />
                      우클릭 + 드래그: 이동
                    </div>
                    <div className="flex items-center gap-2">
                      <ZoomIn className="h-3 w-3" />
                      휠: 확대/축소
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* 🚀 박스 상태도 별도 컴포넌트로 분리 */}
                <BoxStatusDisplay />
                
                <Separator />
                
                <div>
                  <h4 className="mb-2 font-semibold">성능 최적화 정보</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>🚀 개별 박스 구독으로 리렌더링 최적화</div>
                    <div>📦 각 박스는 독립적으로 업데이트</div>
                    <div>💾 위치 변경시 해당 박스만 리렌더링</div>
                    <div>🎯 선택 상태는 별도 구독</div>
                    <div>⚡ React.memo로 불필요한 렌더링 방지</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="mb-2 font-semibold">박스 좌표계</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>🟢 초록점: 우측 상단 꼭지점</div>
                    <div>📦 박스: 해당 지점에서 (-lenX, -lenY, -lenZ) 방향으로 확장</div>
                    <div>🔴 빨간 영역: 바닥 점유 공간</div>
                    <div>⬆️ 위 화살표: 컨베이어로 올리기</div>
                    <div>⬇️ 아래 화살표: 바닥으로 내리기</div>
                    <div>🚚 시퀀셜 이동: 컨베이어 경유 자동 이동</div>
                    <div>✓ 초록 체크: 안정적 (무게중심이 지지면 안쪽)</div>
                    <div>⚠ 빨간 경고: 불안정 (무게중심이 지지면 밖)</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* 🎮 빠른 액션 패널 */}
      <Card className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span>
                개별 구독 패턴으로 최적화된 박스 관리 시스템
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddBox}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                박스 추가
              </Button>
              <Button
                size="sm"
                onClick={handleMoveMultipleBoxes}
                variant="outline"
                className="flex items-center gap-1"
              >
                <Navigation className="h-3 w-3" />
                테스트 이동
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              콘솔에서 렌더링 로그를 확인하세요!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoxManagementContent;