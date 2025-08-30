// features/workflow/api.ts
import type { Workflow, TemplateFormData, WorkflowInstance } from './types';

// Template API
export const templateApi = {
  // 템플릿 목록 조회
  async getTemplates(): Promise<Workflow[]> {
    const res = await fetch('/api/workflow/template');
    const data = await res.json();
    return data.templates || [];
  },

  // 템플릿 저장
  async saveTemplate(template: TemplateFormData): Promise<void> {
    const res = await fetch('/api/workflow/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    
    if (!res.ok) {
      throw new Error('템플릿 저장에 실패했습니다.');
    }
  },

  // 템플릿 삭제
  async deleteTemplate(templateId: number): Promise<void> {
    const res = await fetch(`/api/workflow/template/${templateId}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      throw new Error('템플릿 삭제에 실패했습니다.');
    }
  },
};

// Workflow Instance API
export const workflowApi = {
  // 워크플로우 인스턴스 목록 조회
  async getInstances(): Promise<WorkflowInstance[]> {
    const res = await fetch('/api/workflow/my-workflow');
    const data = await res.json();
    return data.workflows || [];
  },

  // 워크플로우 인스턴스 생성
  async createInstance(instance: Omit<WorkflowInstance, 'id'>): Promise<WorkflowInstance> {
    const res = await fetch('/api/workflow/my-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instance),
    });
    
    if (!res.ok) {
      throw new Error('워크플로우 생성에 실패했습니다.');
    }
    
    return res.json();
  },

  // 워크플로우 상태 업데이트
  async updateInstance(instanceId: number, updates: Partial<WorkflowInstance>): Promise<void> {
    const res = await fetch(`/api/workflow/my-workflow/${instanceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) {
      throw new Error('워크플로우 업데이트에 실패했습니다.');
    }
  },
};

// Node Complete API call
export const nodeApi = {
  // 노드 완료 시 외부 API 호출
  async callCompletionApi(apiConfig: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    authentication?: string;
  }): Promise<void> {
    const { url, method, body, authentication } = apiConfig;
    
    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(authentication ? { Authorization: `Bearer ${authentication}` } : {}),
        },
        ...(method === 'POST' || method === 'PUT' ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      console.error('Node completion API call failed:', error);
      throw error;
    }
  },
};
