import React, { useState, memo, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { useContainerStore } from '@/entities/container';
import { useIsMobile } from '@/shared/hooks/useIsMobile';
import BoxActions from '@/shared/ui/box-actions';

interface BoxCardProps {
  boxId: string;
  onSelect: (boxId: string) => void;
  onMoveToConveyor: (boxId: string) => void;
  onDropToBottom: (boxId: string) => void;
  onMoveToOtherPosition: (boxId: string, x: number, z: number) => void;
}

/**
 * 개별 박스 정보를 표시하는 카드 컴포넌트
 * 박스별로 독립적으로 리렌더링 최적화
 */
const BoxCard: React.FC<BoxCardProps> = memo(({ 
  boxId,
  onSelect, 
  onMoveToConveyor, 
  onDropToBottom,
  onMoveToOtherPosition,
}) => {
  console.log(`🎯 BoxCard ${boxId} 렌더링`);
  
  // 이 박스의 데이터만 구독
  const box = useContainerStore(
    useCallback((state) => state.boxes.get(boxId), [boxId])
  );
  
  // 선택 상태만 별도 구독
  const isSelected = useContainerStore(
    useCallback((state) => state.selectedBoxId === boxId, [boxId])
  );
  
  // 스토어 메서드들은 getState()로 가져와서 참조 안정성 보장
  const { boxes } = useContainerStore.getState();
  
  const isMobile = useIsMobile();
  
  // 박스 데이터가 없으면 렌더링하지 않음
  if (!box) {
    console.log(`❌ BoxCard ${boxId}: 박스 데이터 없음`);
    return null;
  }
  
  // 안정성 정보 계산 (박스 위치/크기 변경시에만 재계산)
  const stabilityInfo = useMemo(() => {
    console.log(`🔍 ${boxId} 안정성 검사 (BoxCard)`);
    const { BoxPhysics } = require('@/entities/box/model/physics');
    return BoxPhysics.checkBoxStability(
      box.x, 
      box.y, 
      box.z, 
      box.lenX, 
      box.lenY, 
      box.lenZ, 
      boxes,
      box.id
    );
  }, [box.x, box.y, box.z, box.lenX, box.lenY, box.lenZ, box.id, boxes]);

  // 이벤트 핸들러들
  const handleCardClick = useCallback(() => {
    console.log(`🎯 ${boxId} 카드 클릭`);
    onSelect(boxId);
  }, [onSelect, boxId]);

  // 모바일에서는 선택된 박스만 액션 버튼 표시
  if (isMobile && !isSelected) {
    return null;
  }

  return (
    <Card
      id={`box-card-${box.id}`}
      className={`transition-all duration-200 p-2 ${isSelected ? 'ring-2 ring-blue-500' : ''} cursor-pointer`}
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
               {stabilityInfo && stabilityInfo.centerX !== undefined && stabilityInfo.centerZ !== undefined && (
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
        
        {/* 액션 버튼들 */}
        <BoxActions
          boxId={boxId}
          box={box}
          isMobile={isMobile}
          onMoveToConveyor={onMoveToConveyor}
          onDropToBottom={onDropToBottom}
          onMoveToOtherPosition={onMoveToOtherPosition}
          onSelect={onSelect}
        />
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // React.memo 비교 함수: boxId와 함수 참조만 비교
  const shouldUpdate = (
    prevProps.boxId !== nextProps.boxId ||
    prevProps.onSelect !== nextProps.onSelect ||
    prevProps.onMoveToConveyor !== nextProps.onMoveToConveyor ||
    prevProps.onDropToBottom !== nextProps.onDropToBottom ||
    prevProps.onMoveToOtherPosition !== nextProps.onMoveToOtherPosition
  );
  
  if (!shouldUpdate) {
    console.log(`🚫 BoxCard ${prevProps.boxId} 리렌더링 방지`);
  }
  
  return !shouldUpdate;
});

BoxCard.displayName = 'BoxCard';

export default BoxCard;

