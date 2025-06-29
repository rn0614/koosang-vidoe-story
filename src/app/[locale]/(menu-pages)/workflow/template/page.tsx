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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
      setWorkflowTitle(template.name || '');
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
    <div className="w-full h-full overflow-hidden bg-gray-100">
      {/* 헤더 */}
      <div className="w-full flex flex-row items-center justify-between border-b bg-white p-4 shadow-sm gap-2">
        <input
          type="text"
          value={workflowTitle}
          onChange={(e) => setWorkflowTitle(e.target.value)}
          placeholder="워크플로우 제목을 입력하세요"
          className="flex-1 min-w-0 max-w-[500px] border-b border-gray-300 bg-transparent px-2 py-1 text-xl font-bold text-gray-800 focus:border-blue-500 focus:outline-none"
        />
        {/* 데스크탑: 버튼 그룹 */}
        <div className="hidden md:flex gap-2 flex-shrink-0">
          <Button onClick={addNode} variant="default" size="default" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            노드 추가
          </Button>
          <Button onClick={saveTemplate} variant="secondary" size="default" className="flex items-center gap-2">
            템플릿 저장
          </Button>
          <Button onClick={loadTemplate} variant="outline" size="default" className="flex items-center gap-2">
            템플릿 불러오기
          </Button>
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
              <DropdownMenuItem onClick={saveTemplate}>
                템플릿 저장
              </DropdownMenuItem>
              <DropdownMenuItem onClick={loadTemplate}>
                템플릿 불러오기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 메인 캔버스 */}
      <div className="w-full h-full overflow-hidden">
        <WorkflowCanvas
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
        />
        <StateExplanation />
      </div>
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