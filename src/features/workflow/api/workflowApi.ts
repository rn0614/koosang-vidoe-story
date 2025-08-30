import { Workflow, WorkflowFormData } from '../types';

// Workflow Instance API
export const workflowApi = {
  // 워크플로우 인스턴스 목록 조회
  async getWorkflowList(): Promise<Workflow[]> {
    const res = await fetch('/api/workflow/my-workflow');
    const data = await res.json();
    return data.workflows || [];
  },

  // 워크플로우 불러오기
  async getWorkflow(id: number): Promise<Workflow> {
    const res = await fetch(`/api/workflow/template/${id}`);
    const data = await res.json();

    console.log('getTemplate data', data);
    return data.template;
  },

  // 워크플로우 인스턴스 생성
  async createWorkflow(workflow: Omit<Workflow, 'id'>): Promise<Workflow> {
    const res = await fetch('/api/workflow/my-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflow),
    });

    if (!res.ok) {
      throw new Error('워크플로우 생성에 실패했습니다.');
    }

    return res.json();
  },

  // 워크플로우 상태 업데이트
  async updateWorkflow(
    instanceId: number,
    updates: Partial<Workflow>,
  ): Promise<void> {
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

  // 템플릿 저장
  async saveWrokflow(workflow: WorkflowFormData): Promise<void> {
    const res = await fetch(`/api/workflow/${workflow.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflow),
    });

    if (!res.ok) {
      throw new Error('템플릿 저장에 실패했습니다.');
    }
  },

  // 템플릿 삭제
  async deleteWorkflow(workflowId: number): Promise<void> {
    const res = await fetch(`/api/workflow/${workflowId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error('템플릿 삭제에 실패했습니다.');
    }
  },
};