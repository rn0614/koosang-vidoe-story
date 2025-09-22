import React, { useState, useCallback } from 'react';
import { Button } from '@/shared/ui/button';
import { Move3D, ArrowUp, ArrowDown, Navigation } from 'lucide-react';
import { BoxData } from '@/entities/box';
import { PositionModal } from '@/features/3d-container/ui';

interface BoxActionsProps {
  boxId: string;
  box: BoxData;
  isMobile: boolean;
  onMoveToConveyor: (boxId: string) => void;
  onDropToBottom: (boxId: string) => void;
  onMoveToOtherPosition: (boxId: string, x: number, z: number) => void;
  onSelect: (boxId: string) => void;
}

/**
 * 박스 액션 버튼들을 관리하는 컴포넌트
 * 모달 상태와 액션 처리를 분리
 */
const BoxActions: React.FC<BoxActionsProps> = ({
  boxId,
  box,
  isMobile,
  onMoveToConveyor,
  onDropToBottom,
  onMoveToOtherPosition,
  onSelect
}) => {
  const [modalMode, setModalMode] = useState<'default' | 'move'>('default');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 모달 관련 핸들러들
  const handleEditOpenModal = useCallback(() => {
    setModalMode('default'); 
    setIsModalOpen(true);
  }, []);
  
  const handleMoveOpenModal = useCallback(() => {
    setModalMode('move'); 
    setIsModalOpen(true);
  }, []);
  
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  
  // 액션 핸들러들
  const handleMoveToConveyorClick = useCallback(() => {
    console.log(`⬆️ ${boxId} 컨베이어 이동 요청`);
    onMoveToConveyor(boxId);
  }, [onMoveToConveyor, boxId]);
  
  const handleDropToBottomClick = useCallback(() => {
    console.log(`⬇️ ${boxId} 바닥 이동 요청`);
    onDropToBottom(boxId);
  }, [onDropToBottom, boxId]);
  
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

  return (
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
      
      {/* 위치/크기 수정 모달 */}
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
};

export default React.memo(BoxActions);

