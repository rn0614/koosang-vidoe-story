import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { useBoxStore } from '@/entities/box';

/**
 * 박스 상태 요약 정보를 표시하는 컴포넌트
 */
export const BoxStatusSummary: React.FC = () => {
  // 박스 개수와 선택 상태만 구독
  const boxCount = useBoxStore(state => state.boxes.size);
  const selectedBoxId = useBoxStore(state => state.selectedBoxId);
  
  return (
    <div className="flex items-center justify-between text-sm">
      <span>총 박스 수:</span>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{boxCount}</Badge>
        {selectedBoxId && (
          <Badge variant="default" className="text-xs">
            선택됨
          </Badge>
        )}
      </div>
    </div>
  );
};
