import React, { useState, memo, useCallback, useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { CheckCircle, XCircle, Move3D, ArrowUp, ArrowDown, Navigation } from 'lucide-react';
import PositionModal from './position-modal';
import { useBoxesStore } from '@/features/3d-visualization';
import { shallow } from 'zustand/shallow';
import { useIsMobile } from '@/shared/hooks/useIsMobile';

interface BoxInfoCardProps {
  boxId: string; // 🚀 box 객체 대신 boxId만 받기
  onSelect: (boxId: string) => void;
  onMoveToConveyor: (boxId: string) => void;
  onDropToBottom: (boxId: string) => void;
  onMoveToOtherPosition: (boxId: string, x: number, z: number) => void;
}

const BoxInfoCard: React.FC<BoxInfoCardProps> = memo(({ 
  boxId,
  onSelect, 
  onMoveToConveyor, 
  onDropToBottom,
  onMoveToOtherPosition,
}) => {
  console.log(`🎯 BoxInfoCard ${boxId} 렌더링`);
  
  // 🚀 핵심 최적화: 이 박스의 데이터만 구독
  const box = useBoxesStore(
    useCallback((state) => state.boxes.get(boxId), [boxId])
  );
  
  // 🚀 선택 상태만 별도 구독
  const isSelected = useBoxesStore(
    useCallback((state) => state.selectedBoxId === boxId, [boxId])
  );
  
  // 🚀 스토어 메서드들은 getState()로 가져와서 참조 안정성 보장
  const checkBoxStability = useBoxesStore.getState().checkBoxStability;
  
  const [modalMode, setModalMode] = useState<'default' | 'move'>('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const isMobile = useIsMobile();
  
  // 박스 데이터가 없으면 렌더링하지 않음
  if (!box) {
    console.log(`❌ BoxInfoCard ${boxId}: 박스 데이터 없음`);
    return null;
  }
  
  // 🎯 안정성 정보는 useMemo로 계산 (박스 위치/크기 변경시에만 재계산)
  const stabilityInfo = useMemo(() => {
    console.log(`🔍 ${boxId} 안정성 검사 (BoxInfoCard)`);
    return checkBoxStability(
      box.x, 
      box.y, 
      box.z, 
      box.lenX, 
      box.lenY, 
      box.lenZ, 
      box.id
    );
  }, [box.x, box.y, box.z, box.lenX, box.lenY, box.lenZ, box.id, checkBoxStability]);

  // 🚀 이벤트 핸들러들을 useCallback으로 메모이제이션
  const handleCardClick = useCallback(() => {
    console.log(`🎯 ${boxId} 카드 클릭`);
    onSelect(boxId);
  }, [onSelect, boxId]);
  
  const handleEditOpenModal = useCallback(() => {
    setModalMode('default'); 
    setIsModalOpen(true);
  }, []);
  
  const handleMoveOpenModal = useCallback(() => {
    setModalMode('move'); 
    setIsModalOpen(true);
  }, []);
  
  const handleMoveToConveyorClick = useCallback(() => {
    console.log(`⬆️ ${boxId} 컨베이어 이동 요청`);
    onMoveToConveyor(boxId);
  }, [onMoveToConveyor, boxId]);
  
  const handleDropToBottomClick = useCallback(() => {
    console.log(`⬇️ ${boxId} 바닥 이동 요청`);
    onDropToBottom(boxId);
  }, [onDropToBottom, boxId]);
  
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  
  const handleModalMove = useCallback((
    boxId: string, 
    x: number, 
    y: number, 
    z: number, 
    lenX: number, 
    lenY: number, 
    lenZ: number
  ) => {
    onSelect(boxId); // 선택 상태 유지
    setIsModalOpen(false);
  }, [onSelect]);
  
  const handleMoveToOtherPosition = useCallback((
    boxId: string, 
    x: number, 
    z: number
  ) => {
    console.log(`🚚 ${boxId} 다른 위치 이동: (${x}, ${z})`);
    onMoveToOtherPosition(boxId, x, z);
    setIsModalOpen(false);
  }, [onMoveToOtherPosition]);

  if (isMobile) {
    // 모바일: 선택된 박스만 버튼 노출, 카드 클릭 불가
    if (!isSelected) return null;
    return (
      <div className="flex space-x-1 mt-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleEditOpenModal}
          title="정확한 위치 설정"
        >
          <Move3D className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={handleMoveToConveyorClick}
          title="컨베이어로 올리기"
        >
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button 
          size="sm" 
          variant="secondary"
          onClick={handleDropToBottomClick}
          title="바닥으로 내리기"
        >
          <ArrowDown className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleMoveOpenModal}
          title="다른 위치로 이동"
        >
          <Navigation className="h-3 w-3" />
        </Button>
        <PositionModal
          box={box}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onMove={handleModalMove}
          mode={modalMode}
          onMoveToOtherPosition={handleMoveToOtherPosition}
        />
      </div>
    );
  }

  return (
    <Card
      id={`box-card-${box.id}`}
      className={`transition-all duration-200 p-2 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full border-2 border-white shadow-sm" 
              style={{ backgroundColor: box.color }}
            />
            <div>
              <div className="font-medium text-xs flex items-center gap-1">
                {box.id}
                {stabilityInfo && (
                  stabilityInfo.isStable ? 
                    <CheckCircle className="h-3 w-3 text-green-500" /> :
                    <XCircle className="h-3 w-3 text-red-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                위치: ({box.x}, {box.y}, {box.z})
              </div>
              <div className="text-xs text-muted-foreground">
                크기: {box.lenX}×{box.lenY}×{box.lenZ}
              </div>
              {stabilityInfo && stabilityInfo.centerX !== undefined && (
                <div className="text-xs text-muted-foreground">
                  중심: ({stabilityInfo.centerX.toFixed(1)}, {stabilityInfo.centerZ.toFixed(1)})
                </div>
              )}
              {stabilityInfo && !stabilityInfo.isStable && stabilityInfo.reason === 'center_unsupported' && (
                <div className="text-xs text-red-500">
                  무게중심이 지지면 밖에 있음
                </div>
              )}
            </div>
            {isSelected && <Badge variant="secondary">선택됨</Badge>}
          </div>
        </div>
        
        <div className="mt-2 flex space-x-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleEditOpenModal}
            title="정확한 위치 설정"
          >
            <Move3D className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleMoveToConveyorClick}
            title="컨베이어로 올리기"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleDropToBottomClick}
            title="바닥으로 내리기"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMoveOpenModal}
            title="다른 위치로 이동"
          >
            <Navigation className="h-3 w-3" />
          </Button>
        </div>
        
        {/* 위치/크기 수정 모달 */}
        <PositionModal
          box={box}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onMove={handleModalMove}
          mode={modalMode}
          onMoveToOtherPosition={handleMoveToOtherPosition}
        />
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // 🚀 React.memo 비교 함수: boxId와 함수 참조만 비교
  const shouldUpdate = (
    prevProps.boxId !== nextProps.boxId ||
    prevProps.onSelect !== nextProps.onSelect ||
    prevProps.onMoveToConveyor !== nextProps.onMoveToConveyor ||
    prevProps.onDropToBottom !== nextProps.onDropToBottom ||
    prevProps.onMoveToOtherPosition !== nextProps.onMoveToOtherPosition
  );
  
  if (!shouldUpdate) {
    console.log(`🚫 BoxInfoCard ${prevProps.boxId} 리렌더링 방지`);
  }
  
  return !shouldUpdate;
});

BoxInfoCard.displayName = 'BoxInfoCard';

export default BoxInfoCard;