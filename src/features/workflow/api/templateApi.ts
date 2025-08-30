import { WorkflowFormData, Workflow } from '../types';

// Template API
export const templateApi = {
  // 템플릿 목록 조회
  async getTemplatesList(): Promise<Workflow[]> {
    const res = await fetch('/api/workflow/template');
    const data = await res.json();
    return data.templates || [];
  },

  // 템플릿 불러오기
  async getTemplate(id: number): Promise<Workflow> {
    const res = await fetch(`/api/workflow/template/${id}`);
    const data = await res.json();

    console.log('getTemplate data', data);
    return data.template;
  },

  // 템플릿 저장
  async saveTemplate(template: WorkflowFormData): Promise<void> {
    let res;
    if (!template.id) {
      res = await fetch('/api/workflow/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
    } else {
      res = await fetch(`/api/workflow/template/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
    }

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
