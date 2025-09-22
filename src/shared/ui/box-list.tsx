import React, { useMemo, useCallback } from 'react';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { useContainerStore } from '@/entities/container';
import { useIsMobile } from '@/shared/hooks/useIsMobile';

interface BoxListProps {
  onSelect: (boxId: string) => void;
}

/**
 * 간단한 박스 목록을 표시하는 컴포넌트
 * 한 줄로 박스 정보만 표시
 */
const BoxList: React.FC<BoxListProps> = ({ onSelect }) => {
  const isMobile = useIsMobile();
  
  // 박스 개수만 구독 (성능 최적화)
  const boxCount = useContainerStore((state) => state.boxes.size);
  const selectedBoxId = useContainerStore((state) => state.selectedBoxId);
  
  // boxIds는 박스 개수 변경시에만 재계산
  const boxIds = useMemo(() => {
    console.log('📋 BoxList: boxIds 재계산');
    return useContainerStore.getState().getAllBoxIds();
  }, [boxCount]);
  
  // 박스 클릭 핸들러
  const handleBoxClick = useCallback((boxId: string) => {
    onSelect(boxId);
  }, [onSelect]);
  
  return (
    <ScrollArea className={isMobile ? 'h-auto' : 'h-60'}>
      <div className="space-y-1">
        {boxIds.map((boxId) => {
          const box = useContainerStore.getState().boxes.get(boxId);
          if (!box) return null;
          
          return (
            <div
              key={boxId}
              className={`p-2 rounded-md cursor-pointer transition-colors text-xs ${
                selectedBoxId === boxId 
                  ? 'bg-blue-100 border border-blue-300' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => handleBoxClick(boxId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm" 
                    style={{ backgroundColor: box.color }}
                  />
                  <span className="font-medium">{box.id}</span>
                </div>
                <div className="text-gray-600">
                  ({box.x}, {box.y}, {box.z}) | {box.lenX}×{box.lenY}×{box.lenZ}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default React.memo(BoxList);

