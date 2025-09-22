'use client';
import React, { Suspense } from 'react';
import ThreeDContainer from '@/widgets/3d-container';
import { LoadingScreen } from '@/widgets/3d-container/components/loading-screen';

interface PageProps {
  params: {
    id: string;
    locale: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  return (
    <Suspense 
      fallback={
        <LoadingScreen 
          message="3D 컨테이너를 초기화하는 중입니다..."
          containerId={params.id}
        />
      }
    >
      <ThreeDContainer containerId={params.id} />
    </Suspense>
  );
};

export default Page;
