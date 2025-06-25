// components/FlowEditor.tsx
'use client';
import React, { useState, useCallback, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { StateExplanation } from '@/components/workflow/state-eplanation';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { WorkflowProvider, useWorkflowContext } from '@/contexts/WorkflowContext';
import {
  workflowConnectionMock,
  workflowNodeMock,
} from '@/__mocks__/work-flow.mock';
import { WorkflowConnection, WorkflowNode } from '@/shared/types/workflow';

// 템플릿 타입
interface WorkflowTemplate {
  id: number;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

// 내부 에디터 컴포넌트 (Context 내부에서 실행)
const FlowEditorContent = () => {
  console.log('[RENDER] FlowEditorContent');
  const { addNode, getAllNodeIds, getNode, getConnections, replaceAll } = useWorkflowContext();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [templateId, setTemplateId] = useState<number | null>(null);

  const [isPending, startTransition] = useTransition();

  // 템플릿 목록 불러오기
  const fetchTemplates = useCallback(async () => {
    const res = await fetch('/api/workflow/template');
    const data = await res.json();
    console.debug('[USER_ACTION] 템플릿 목록 불러오기', data.templates || []);
    setTemplates(data.templates || []);
    return data.templates || [];
  }, []);

  // 템플릿 적용
  const loadTemplate = useCallback(async () => {
    const list = await fetchTemplates();
    if (!list.length) {
      alert('저장된 템플릿이 없습니다.');
      return;
    }
    const nameList = list
      .map((t: WorkflowTemplate, i: number) => `${i + 1}. ${t.name}`)
      .join('\n');
    const idx = window.prompt(`불러올 템플릿 번호를 입력하세요:\n${nameList}`);
    const sel = Number(idx) - 1;
    if (isNaN(sel) || sel < 0 || sel >= list.length) return;
    
    const template = list[sel];

    setTimeout(() => {
      replaceAll(template.template?.nodes || [], template.template?.connections || []);
      alert('템플릿이 적용되었습니다!');
    }, 0);
  }, [fetchTemplates, replaceAll]);

  // 템플릿 저장 함수
  const saveTemplate = useCallback(async () => {
    try {
      const nodeIds = getAllNodeIds();
      const nodes = nodeIds.map(id => getNode(id)).filter(Boolean);
      const connections = getConnections();
      
      const template = {
        id: templateId,
        name: workflowTitle,
        nodes,
        connections,
      };
      
      console.debug('[USER_ACTION] 템플릿 저장', template);
      await fetch('/api/workflow/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      alert('템플릿이 성공적으로 저장되었습니다!');
    } catch (err) {
      alert('저장에 실패했습니다.');
    }
  }, [workflowTitle, templateId, getAllNodeIds, getNode, getConnections]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <input
          type="text"
          value={workflowTitle}
          onChange={(e) => setWorkflowTitle(e.target.value)}
          placeholder="워크플로우 제목을 입력하세요"
          className="min-w-[300px] border-b border-gray-300 bg-transparent px-2 py-1 text-xl font-bold text-gray-800 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={addNode}
            className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            노드 추가
          </button>
          <button
            onClick={saveTemplate}
            className="flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            템플릿 저장
          </button>
          <button
            onClick={loadTemplate}
            className="flex items-center gap-2 rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            템플릿 불러오기
          </button>
        </div>
      </div>

      {/* 메인 캔버스 */}
      <WorkflowCanvas
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
      />

      <StateExplanation />
    </div>
  );
};

// 메인 플로우 에디터 컴포넌트
const FlowEditor = () => {
  return (
    <WorkflowProvider 
      initialNodes={workflowNodeMock}
      initialConnections={workflowConnectionMock}
    >
      <FlowEditorContent />
    </WorkflowProvider>
  );
};

export default FlowEditor;