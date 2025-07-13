// components/FlowEditor.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { StateExplanation } from '@/components/workflow/state-eplanation';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { WorkflowProvider, useWorkflowContext } from '@/contexts/WorkflowContext';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// 내부 에디터 컴포넌트 (Context 내부에서 실행)
const FlowEditorContent = () => {
  const { addNode, getAllNodeIds, getNode, getConnections, replaceAll } = useWorkflowContext();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const { Id } = useParams();

  // 워크플로우 데이터 불러와서 제목, id 세팅
  useEffect(() => {
    if (!Id) return;
    fetch(`/api/workflow/${Id}`)
      .then(res => res.json())
      .then(data => {
        if (data?.workflow) {
          setWorkflowTitle(data.workflow.name || '');
          setWorkflowId(data.workflow.id || null);
        }
      });
  }, [Id]);

  // 템플릿 저장 함수 (예시)
  const saveTemplate = useCallback(async () => {
    try {
      const nodeIds = getAllNodeIds();
      const nodes = nodeIds.map(id => getNode(id)).filter(Boolean) as NonNullable<ReturnType<typeof getNode>>[];
      const connections = getConnections();

      // 진행중인 노드만 추출
      const currentNodes = nodes
        .filter(node => node.state === 'do')
        .map(node => ({
          id: node.id,
          role: node.role,
          title: node.title,
        }));

      const template = {
        id: workflowId,
        name: workflowTitle,
        nodes,
        connections,
        current_nodes: currentNodes, // ← 이 부분!
      };
      await fetch(`/api/workflow/${Id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      alert('workflow가 성공적으로 저장되었습니다!');
    } catch (err) {
      alert('저장에 실패했습니다.');
    }
  }, [workflowTitle, workflowId, getAllNodeIds, getNode, getConnections]);

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
            workflow 저장
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
                workflow 저장
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

// 메인 플로우 에디터 컴포넌트 (id 기반 워크플로우 fetch)
const FlowEditor = () => {
  const { Id } = useParams();
  const [initialNodes, setInitialNodes] = useState<any[]>([]);
  const [initialConnections, setInitialConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Id) return;
    setLoading(true);
    fetch(`/api/workflow/${Id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setInitialNodes([]);
          setInitialConnections([]);
        } else {
          setInitialNodes(data.workflow?.workflow?.nodes || []);
          setInitialConnections(data.workflow?.workflow?.connections || []);
        }
        setLoading(false);
      })
      .catch(err => {
        setError('네트워크 오류');
        setLoading(false);
      });
  }, [Id]);

  if (loading) return <div className="p-8 text-center">로딩중...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <WorkflowProvider
      initialNodes={initialNodes}
      initialConnections={initialConnections}
    >
      <FlowEditorContent />
    </WorkflowProvider>
  );
};

export default FlowEditor;