import React from 'react';
import { use3DContainer } from '@/features/3d-container/hooks/use3DContainer';
import { LoadingScreen } from '@/widgets/3d-container/components/loading-screen';
import ThreeCanvas from './canvas/3d-canvas';
import ContainerInfoPanel from './panels/container-info-panel';
import BoxManagementPanel from './panels/box-management-panel';

interface ThreeDContainerMainProps {
  containerId: string;
}

/**
 * 3D 컨테이너 메인 컴포넌트
 * 로직과 UI를 분리하여 성능을 최적화
 */
const ThreeDContainerMain: React.FC<ThreeDContainerMainProps> = ({ containerId }) => {
  const {
    isDataReady,
    isLoading,
    error,
    currentContainerId,
    handleSelectBox,
    handleMoveToConveyor,
    handleDropToBottom,
    handleMoveToOtherPosition,
    handleSaveToDatabase,
    handleBackToList,
  } = use3DContainer({ containerId });

  // 개발 모드에서만 렌더링 로그 (성능 최적화)
  if (process.env.NODE_ENV === 'development') {
    console.log('🏗️ ThreeDContainerMain 렌더링:', {
      containerId,
      currentContainerId,
      isDataReady,
      isLoading,
      hasError: !!error
    });
  }

  // 로딩 상태 체크 (Zustand 기반)
  const shouldShowLoading = isLoading || !isDataReady || !currentContainerId;
  
  if (shouldShowLoading) {
    let loadingMessage = "컨테이너를 로딩 중입니다...";
    
    if (error) {
      loadingMessage = `오류 발생: ${error}`;
    } else if (isLoading) {
      loadingMessage = "데이터를 불러오는 중입니다...";
    } else if (!currentContainerId) {
      loadingMessage = "컨테이너 정보를 확인하는 중입니다...";
    } else if (!isDataReady) {
      loadingMessage = "박스 데이터를 준비하는 중입니다...";
    }
    
    return (
      <LoadingScreen 
        message={loadingMessage}
        containerId={containerId}
      />
    );
  }

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
      {/* 3D Canvas */}
      <ThreeCanvas onSelectBox={handleSelectBox} />

      {/* Container Info Panel */}
      <ContainerInfoPanel
        onBackToList={handleBackToList}
        onSaveToDatabase={handleSaveToDatabase}
      />

      {/* Box Management Panel */}
      <BoxManagementPanel
        onSelectBox={handleSelectBox}
        onMoveToConveyor={handleMoveToConveyor}
        onDropToBottom={handleDropToBottom}
        onMoveToOtherPosition={handleMoveToOtherPosition}
        onBackToList={handleBackToList}
        onSaveToDatabase={handleSaveToDatabase}
      />
    </div>
  );
};

export default React.memo(ThreeDContainerMain);
