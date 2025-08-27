import React from 'react';
import { useBoxesStore } from '@/features/3d-visualization';

// 🎯 선택된 박스 ID만 표시하는 별도 컴포넌트
const SelectedBoxDisplay: React.FC = () => {
  // 🚀 이 컴포넌트만 selectedBoxId를 구독
  const selectedBoxId = useBoxesStore(state => state.selectedBoxId);
  
  return (
    <div className="text-xs text-muted-foreground">
      선택된 박스: {selectedBoxId || '없음'}
    </div>
  );
};

export default SelectedBoxDisplay;