import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Database, ArrowLeft, Save } from 'lucide-react';
import { useContainerStore } from '@/entities/container';

interface ContainerInfoPanelProps {
  onBackToList: () => void;
  onSaveToDatabase: () => void;
}

/**
 * 컨테이너 정보 패널
 * 현재 컨테이너 정보와 저장/뒤로가기 버튼을 표시
 */
const ContainerInfoPanel: React.FC<ContainerInfoPanelProps> = ({
  onBackToList,
  onSaveToDatabase,
}) => {
  // 컨테이너 정보만 구독
  const currentContainerId = useContainerStore((state) => state.currentContainer?.id);
  const currentContainerName = useContainerStore((state) => state.currentContainer?.name);
  const boxCount = useContainerStore((state) => state.boxes.size);

  console.log('📋 ContainerInfoPanel 렌더링');

  if (!currentContainerId) {
    return null;
  }

  return (
    <Card className="absolute top-4 right-4 w-80 bg-background/80 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            현재 컨테이너
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToList}
              title="컨테이너 목록으로 돌아가기"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveToDatabase}
              title="현재 박스 위치 저장"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm">
          <p className="font-medium">{currentContainerName || '알 수 없는 컨테이너'}</p>
          <p className="text-muted-foreground">박스 {boxCount}개</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ContainerInfoPanel);
