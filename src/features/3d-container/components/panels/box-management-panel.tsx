import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Move3D, Plus, Save, ArrowLeft } from 'lucide-react';
import BoxList from '@/shared/ui/box-list';
import SelectedBoxDetail from '@/shared/ui/selected-box-detail';
import { useContainerStore } from '@/entities/container';
import { useBoxCreation } from '@/entities/box';
import { BoxStatusSummary } from '@/widgets/3d-container/components/box-status-summary';

interface BoxManagementPanelProps {
  onSelectBox: (boxId: string) => void;
  onMoveToConveyor: (boxId: string) => void;
  onDropToBottom: (boxId: string) => void;
  onMoveToOtherPosition: (boxId: string, x: number, z: number) => void;
  onBackToList: () => void;
  onSaveToDatabase: () => void;
}

/**
 * 박스 관리 패널
 * 박스 목록, 추가, 액션 버튼들을 관리
 */
const BoxManagementPanel: React.FC<BoxManagementPanelProps> = ({
  onSelectBox,
  onMoveToConveyor,
  onDropToBottom,
  onMoveToOtherPosition,
  onBackToList,
  onSaveToDatabase,
}) => {
  const currentContainerId = useContainerStore((state) => state.currentContainer?.id);
  const { addNewBox } = useBoxCreation();

  // 핸들러들을 메모이제이션
  const stableHandlers = useMemo(
    () => ({
      onSelect: onSelectBox,
      onMoveToConveyor,
      onDropToBottom,
      onMoveToOtherPosition,
    }),
    [onSelectBox, onMoveToConveyor, onDropToBottom, onMoveToOtherPosition],
  );

  console.log('🎛️ BoxManagementPanel 렌더링');

  return (
    <Card className="absolute bottom-4 right-4 w-80 bg-background/80 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move3D className="h-5 w-5" />
            박스 관리 시스템
          </div>
          {!currentContainerId && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToList}
              title="컨테이너 목록으로 돌아가기"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* No Container Warning */}
        {!currentContainerId && (
          <div className="mb-3 p-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md">
            ⚠️ 컨테이너를 선택하여 데이터베이스와 연동하세요.
          </div>
        )}
        
        {/* Header Controls */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">박스 목록</span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={addNewBox}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              추가
            </Button>
            {currentContainerId && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveToDatabase}
                title="현재 박스 위치 저장"
              >
                <Save className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Status Information */}
        <div className="mb-3">
          <BoxStatusSummary />
        </div>
        
        {/* Box List */}
        <div className="mb-3">
          <div className="text-sm font-medium mb-2">박스 목록</div>
          <BoxList onSelect={stableHandlers.onSelect} />
        </div>
        
        {/* Selected Box Detail */}
        <div>
          <div className="text-sm font-medium mb-2">선택된 박스</div>
          <SelectedBoxDetail
            onMoveToConveyor={stableHandlers.onMoveToConveyor}
            onDropToBottom={stableHandlers.onDropToBottom}
            onMoveToOtherPosition={stableHandlers.onMoveToOtherPosition}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(BoxManagementPanel);
