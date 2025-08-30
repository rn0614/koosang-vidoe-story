// features/workflow/components/template-manager.tsx
'use client';
import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/shared/ui/dropdown-menu';
import { useWorkflowStore } from '../context';
import { useTemplateManager } from '../hooks/useTemplateManager';
import type { Workflow } from '../types';

interface TemplateManagerProps {
  workflowTitle: string;
  onTitleChange: (title: string) => void;
  className?: string;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  workflowTitle,
  onTitleChange,
  className = '',
}) => {
  const store = useWorkflowStore();
  const { addNode } = store.getState();
  const {
    templates,
    isLoading,
    loadTemplate,
    saveTemplate,
    deleteTemplate,
    refreshTemplates,
  } = useTemplateManager();

  const [showTemplateList, setShowTemplateList] = useState(false);

  const handleSaveTemplate = useCallback(async () => {
    if (!workflowTitle.trim()) {
      alert('워크플로우 제목을 입력해주세요.');
      return;
    }
    
    try {
      await saveTemplate(workflowTitle);
      alert('템플릿이 성공적으로 저장되었습니다!');
    } catch (error) {
      alert('저장에 실패했습니다: ' + error);
    }
  }, [workflowTitle, saveTemplate]);

  const handleLoadTemplate = useCallback(async (template: Workflow) => {
    try {
      await loadTemplate(template);
      onTitleChange(template.title);
      setShowTemplateList(false);
      alert('템플릿이 적용되었습니다!');
    } catch (error) {
      alert('템플릿 불러오기에 실패했습니다: ' + error);
    }
  }, [loadTemplate, onTitleChange]);

  const handleDeleteTemplate = useCallback(async (templateId: number, templateName: string) => {
    if (!confirm(`'${templateName}' 템플릿을 삭제하시겠습니까?`)) {
      return;
    }
    
    try {
      await deleteTemplate(templateId);
      alert('템플릿이 삭제되었습니다.');
      refreshTemplates();
    } catch (error) {
      alert('삭제에 실패했습니다: ' + error);
    }
  }, [deleteTemplate, refreshTemplates]);

  return (
    <div className={`flex flex-row items-center justify-between gap-2 ${className}`}>
      <Input
        type="text"
        value={workflowTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="워크플로우 제목을 입력하세요"
        className="flex-1 min-w-0 max-w-[500px] text-xl font-bold"
      />
      
      {/* 데스크탑: 버튼 그룹 */}
      <div className="hidden md:flex gap-2 flex-shrink-0">
        <Button 
          onClick={addNode} 
          variant="default" 
          size="default" 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          노드 추가
        </Button>
        
        <Button 
          onClick={handleSaveTemplate} 
          variant="secondary" 
          size="default"
          disabled={isLoading}
        >
          템플릿 저장
        </Button>
        
        <DropdownMenu open={showTemplateList} onOpenChange={setShowTemplateList}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="default" disabled={isLoading}>
              템플릿 불러오기
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {templates.length === 0 ? (
              <DropdownMenuItem disabled>
                저장된 템플릿이 없습니다
              </DropdownMenuItem>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="flex items-center justify-between px-2 py-1">
                  <button
                    onClick={() => handleLoadTemplate(template)}
                    className="flex-1 text-left px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    {template.title}
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id, template.title)}
                    className="px-2 py-1 text-red-600 hover:bg-red-100 rounded text-sm"
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* 모바일: 드롭다운 메뉴 */}
      <div className="flex md:hidden justify-end flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="default" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              메뉴
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={addNode}>
              <Plus className="h-4 w-4 mr-2" /> 노드 추가
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveTemplate} disabled={isLoading}>
              템플릿 저장
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowTemplateList(true)} disabled={isLoading}>
              템플릿 불러오기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
