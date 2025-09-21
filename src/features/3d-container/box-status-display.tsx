import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { useBoxesStore } from '@/features/3d-container';

// 🎯 박스 상태 표시만 담당하는 별도 컴포넌트
const BoxStatusDisplay: React.FC = () => {
  // 🚀 박스 개수와 선택 상태만 구독
  const boxCount = useBoxesStore(state => state.boxes.size);
  const selectedBoxId = useBoxesStore(state => state.selectedBoxId);
  
  return (
    <div>
      <h4 className="mb-2 font-semibold">박스 상태</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>총 박스 수:</span>
          <Badge variant="outline">{boxCount}</Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span>선택된 박스:</span>
          <Badge variant={selectedBoxId ? "default" : "secondary"}>
            {selectedBoxId || "없음"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default BoxStatusDisplay;