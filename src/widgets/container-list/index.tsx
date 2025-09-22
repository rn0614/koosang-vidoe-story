'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { 
  Box, 
  Plus, 
  ArrowRight, 
  Calendar,
  Ruler,
  Eye
} from 'lucide-react';
import { useContainerManager } from '@/features/3d-container/hooks/useContainerManager';
import type { Container3DData } from '@/features/3d-container/api/containerApi';

/**
 * 3D 컨테이너 목록 페이지
 * 컨테이너를 선택하여 3D 뷰로 이동하는 랜딩 페이지
 */
export const ContainerListPage: React.FC = () => {
  const router = useRouter();
  const {
    containers,
    isLoading,
    error,
    refreshContainers,
    createContainer,
    deleteContainer
  } = useContainerManager();

  // 컨테이너 선택 핸들러 (동적 라우팅으로 이동)
  const handleContainerSelect = (container: Container3DData) => {
    router.push(`/3d/container/${container.id}`);
  };

  // 새 컨테이너 생성 핸들러
  const handleCreateNewContainer = async () => {
    try {
      const newContainer = await createContainer(
        `컨테이너 ${containers.length + 1}`,
        '새로 생성된 3D 컨테이너',
        { width: 50, height: 30, depth: 40 }
      );
      
      // 생성 후 바로 해당 컨테이너로 이동
      if (newContainer) {
        router.push(`/3d/container/${newContainer.id}`);
      }
    } catch (error) {
      console.error('컨테이너 생성 실패:', error);
      alert('컨테이너 생성에 실패했습니다.');
    }
  };

  // 컨테이너 삭제 핸들러
  const handleDeleteContainer = async (container: Container3DData, e: React.MouseEvent) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    
    if (confirm(`'${container.name}' 컨테이너를 정말 삭제하시겠습니까?`)) {
      try {
        await deleteContainer(container.id);
      } catch (error) {
        console.error('컨테이너 삭제 실패:', error);
        alert('컨테이너 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Box className="h-8 w-8 text-blue-600" />
                3D 컨테이너 관리
              </h1>
              <p className="text-slate-600 mt-2">
                3D 박스 관리를 위한 컨테이너를 선택하거나 새로 생성하세요.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={refreshContainers}
                disabled={isLoading}
              >
                새로고침
              </Button>
              <Button
                onClick={handleCreateNewContainer}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                새 컨테이너
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">컨테이너 목록을 불러오는 중...</p>
          </div>
        )}

        {/* Container Grid */}
        {!isLoading && (
          <>
            {containers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {containers.map((container) => (
                  <Card 
                    key={container.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-blue-300 group"
                    onClick={() => handleContainerSelect(container as Container3DData)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Box className="h-5 w-5 text-blue-600" />
                          <span className="truncate text-sm font-medium">
                            {container.name}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {/* 컨테이너 설명 */}
                      {container.description && (
                        <p className="text-sm text-slate-600 overflow-hidden text-ellipsis" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {container.description}
                        </p>
                      )}
                      
                      {/* 컨테이너 크기 정보 */}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Ruler className="h-4 w-4" />
                        <span>
                          {container.width} × {container.height} × {container.depth}
                        </span>
                      </div>
                      
                      {/* 생성일 */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(container.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContainerSelect(container as Container3DData);
                          }}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Eye className="h-3 w-3" />
                          열기
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteContainer(container as Container3DData, e)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                        >
                          삭제
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Empty State
              <Card className="py-12">
                <CardContent className="text-center">
                  <Box className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    컨테이너가 없습니다
                  </h3>
                  <p className="text-slate-600 mb-6">
                    첫 번째 3D 컨테이너를 생성하여 박스 관리를 시작하세요.
                  </p>
                  <Button
                    onClick={handleCreateNewContainer}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    첫 컨테이너 만들기
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
        
        {/* Quick Stats */}
        {containers.length > 0 && (
          <Card className="mt-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>총 {containers.length}개의 컨테이너</span>
                <span>
                  활성 컨테이너: {containers.filter(c => c.is_active).length}개
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
