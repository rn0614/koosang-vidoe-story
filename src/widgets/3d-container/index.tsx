import React from 'react';
import { ThreeDContainerMain } from '@/features/3d-container';

interface ThreeDContainerProps {
  containerId: string;
}

/**
 * 3D 컨테이너 위젯 (래퍼)
 * 실제 로직은 features/3d-container로 이동
 */
const ThreeDContainer: React.FC<ThreeDContainerProps> = ({ containerId }) => {
  console.log('📱 ThreeDContainer Widget 렌더링, containerId:', containerId);

  return <ThreeDContainerMain containerId={containerId} />;
};

export default React.memo(ThreeDContainer);