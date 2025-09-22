import React from 'react';
import { useBoxSelection } from '@/entities/box';

/**
 * 선택된 박스 정보를 표시하는 컴포넌트
 */
export const SelectedBoxDisplay: React.FC = () => {
  const { selectedBoxId } = useBoxSelection();
  
  return (
    <div className="text-xs text-muted-foreground">
      선택된 박스: {selectedBoxId || '없음'}
    </div>
  );
};
