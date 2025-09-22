'use client';

import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Box, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  containerId?: string;
}

/**
 * 3D 컨테이너 로딩 화면
 * 데이터 로딩 중이나 컨테이너를 찾을 수 없을 때 표시
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "컨테이너를 로딩 중입니다...",
  containerId 
}) => {
  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <Card className="w-96 bg-background/90 shadow-2xl backdrop-blur-sm border-slate-200">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* 애니메이션 아이콘 */}
            <div className="relative">
              <Box className="h-16 w-16 mx-auto text-blue-600 animate-pulse" />
              <Loader2 className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
            </div>
            
            {/* 로딩 메시지 */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">
                3D 컨테이너 준비 중
              </h2>
              <p className="text-slate-600 text-sm">
                {message}
              </p>
              {containerId && (
                <p className="text-xs text-slate-400 font-mono break-all">
                  ID: {containerId}
                </p>
              )}
            </div>
            
            {/* 진행 표시 */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>데이터 로딩</span>
                <span>준비 중...</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}>
                  <div className="h-full bg-blue-400 rounded-full animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
            
            {/* 로딩 단계 */}
            <div className="text-left space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>컨테이너 정보 확인</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>박스 데이터 로딩</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <span>3D 환경 준비</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

