// features/workflow/hooks/useTemplateManager.ts
import { useState, useCallback, useEffect } from 'react';
import { templateApi } from '../api';
import { useWorkflowTemplate, useWorkflowStore } from '../context';
import type { Workflow, WorkflowNode } from '../types';

export const useTemplateManager = () => {
  const [templates, setTemplates] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Template management from Context
  const { currentTemplateId, setCurrentTemplateId } = useWorkflowTemplate();
  
  // Store operations from Zustand
  const store = useWorkflowStore();

  // 템플릿 목록 불러오기
  const refreshTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedTemplates = await templateApi.getTemplates();
      setTemplates(fetchedTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 템플릿 목록 로드
  useEffect(() => {
    refreshTemplates();
  }, [refreshTemplates]);

  // 템플릿 저장
  const saveTemplate = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const state = store.getState();
      const nodeIds = state.nodeIds; // ✅ 캐시된 배열 직접 사용
      const nodes = nodeIds.map(id => state.getNode(id)).filter(Boolean) as WorkflowNode[];
      const connections = state.getConnections();
      
      const templateData = {
        id: currentTemplateId || undefined,
        name,
        nodes,
        connections,
      };
      
      await templateApi.saveTemplate(templateData);
      await refreshTemplates(); // 목록 갱신
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿 저장에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [store, currentTemplateId, refreshTemplates]);

  // 템플릿 불러오기
  const loadTemplate = useCallback(async (template: Workflow) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setCurrentTemplateId(template.id);
      const nodes = template.template?.nodes || [];
      const connections = template.template?.connections || [];
      
      // Zustand store의 replaceAll 사용
      store.getState().replaceAll(nodes, connections);
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [store, setCurrentTemplateId]);

  // 템플릿 삭제
  const deleteTemplate = useCallback(async (templateId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await templateApi.deleteTemplate(templateId);
      // 현재 편집 중인 템플릿이 삭제된 경우 ID 초기화
      if (currentTemplateId === templateId) {
        setCurrentTemplateId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '템플릿 삭제에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentTemplateId, setCurrentTemplateId]);

  return {
    templates,
    isLoading,
    error,
    refreshTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  };
};
