'use client';
import React, { useState, useCallback, useRef } from 'react';
import { Plus } from 'lucide-react';
import { StateExplanation } from '@/components/workflow/state-eplanation';
import {
  workflowConnectionMock,
  workflowNodeMock,
} from '@/mocks/data/work-flow.mock';
import type {
  WorkflowNode,
  WorkflowConnection,
  WorkflowNodeState,
} from '@/types/workflow';
import { WorkflowCanvas } from '@/components/workflow/workflow-canvas';
import { arrayToMap } from '@/lib/utils';

// 템플릿 타입
interface WorkflowTemplate {
  id: number;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

// 메인 플로우 에디터 컴포넌트
const FlowEditor = () => {
  const [nodes, setNodes] = useState<Record<string, WorkflowNode>>(() =>
    arrayToMap(workflowNodeMock),
  );

  const [connections, setConnections] = useState<WorkflowConnection[]>(
    workflowConnectionMock,
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 템플릿 목록 상태
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);

  const [workflowTitle, setWorkflowTitle] = useState('');
  const [templateId, setTemplateId] = useState<number | null>(null);

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
    setWorkflowTitle(template.name || '');
    const nodesArr = template.template?.nodes || [];
    const connectionsArr = template.template?.connections || [];
    setNodes(arrayToMap(nodesArr));
    setConnections(connectionsArr);
    setTemplateId(template.id);
    console.debug('[USER_ACTION] 템플릿 적용', template);
    alert('템플릿이 적용되었습니다!');
  }, [fetchTemplates]);

  // 노드 업데이트
  const updateNode = useCallback(
    (nodeId: string, updatedData: Partial<WorkflowNode>) => {
      console.debug('[USER_ACTION] 노드 업데이트', { nodeId, updatedData });
      setNodes((prev) => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], ...updatedData },
      }));
    },
    [],
  );

  // 상태 변경 처리
  const handleStatusChange = useCallback(
    (nodeId: string, status: WorkflowNodeState) => {
      console.debug('[USER_ACTION] 노드 상태 변경', { nodeId, status });
      const currentNode = nodes[nodeId];
      if (!currentNode || currentNode.state !== 'do') return;

      if (status === 'complete' || status === 'fail') {
        setNodes((prev) => {
          const updated = {
            ...prev,
            [nodeId]: { ...prev[nodeId], state: status },
          };

          (currentNode.nextFlow || []).forEach((nextId) => {
            const nextNode = updated[nextId] as WorkflowNode;

            if (!nextNode || nextNode.state !== 'wait') return;
            const requiredIds = nextNode.activateCondition || [];
            const allComplete =
              requiredIds.length > 0 &&
              requiredIds.every((fid) => updated[fid]?.state === 'complete');
            if (
              (allComplete && nextNode.activateConditionType === 'all') ||
              (nextNode.activateConditionType === 'any' &&
                requiredIds.length > 0)
            ) {
              updated[nextId] = { ...nextNode, state: 'do' };
            }
          });

          if (status === 'complete' && currentNode.onCompleteApi) {
            const { url, method, body, authentication } =
              currentNode.onCompleteApi;
            console.debug('[USER_ACTION] 노드 완료시 API 호출', { url, method, body });
            fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                ...(authentication ? { Authorization: `Bearer ${authentication}` } : {}),
              },
              ...(method === 'POST' || method === 'PUT'
                ? { body: JSON.stringify(body) }
                : {}),
            }).then((res) => res.json());
          }

          return updated;
        });
      }
    },
    [nodes],
  );

  // 새 노드 추가
  const addNode = useCallback(() => {
    // 현재 viewport 중앙 좌표 계산
    const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
    const scrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;
    const centerX = scrollX + window.innerWidth / 2;
    const centerY = scrollY + window.innerHeight / 2;
    // 노드 크기(가로 200, 세로 150 기준) 중앙 정렬
    const newX = centerX - 100;
    const newY = centerY - 75;
    const newId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id: newId,
      title: '새 노드',
      role: 'User',
      state: 'wait',
      x: newX,
      y: newY,
      frontFlow: [],
      nextFlow: [],
      nextFlowCondition: '',
      doCondition: '',
      activateConditionType: 'all',
    };
    console.debug('[USER_ACTION] 노드 추가', newNode);
    setNodes((prev) => ({
      ...prev,
      [newId]: newNode,
    }));
  }, []);

  // 템플릿 저장 함수
  const saveTemplate = useCallback(async () => {
    try {
      const template = {
        id: templateId,
        name: workflowTitle,
        nodes: Object.values(nodes),
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
  }, [nodes, connections, workflowTitle, templateId]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    console.debug('[USER_ACTION] 노드 삭제', { nodeId });
    setNodes((prev) => {
      const newNodes = { ...prev };
      delete newNodes[nodeId];
      return newNodes;
    });
    setConnections((prev) =>
      prev.filter((conn) => conn.from !== nodeId && conn.to !== nodeId),
    );
  }, []);

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
        nodes={nodes}
        setNodes={setNodes}
        connections={connections}
        setConnections={setConnections}
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
        updateNode={updateNode}
        handleStatusChange={handleStatusChange}
        handleNodeDelete={handleNodeDelete}
      />

      <StateExplanation />
    </div>
  );
};

export default FlowEditor;
