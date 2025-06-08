import { WorkflowNode, WorkflowNodeState } from "@/types/workflow";

export const workflowNodeMock: WorkflowNode[] = [
  {
    id: 'node-1',
    title: '프로젝트 시작',
    role: 'PM',
    state: 'do' as WorkflowNodeState,
    x: 100,
    y: 100,
    frontFlow: [],
    nextFlow: ['node-2'],
    nextFlowCondition: '승인 완료시',
    doCondition: '프로젝트 계획서 작성',
    activateConditionType: 'all',
    activateCondition: [],
  },
  {
    id: 'node-2',
    title: '개발 시작',
    role: 'Developer',
    state: 'wait' as WorkflowNodeState,
    x: 400,
    y: 100,
    frontFlow: ['node-1'],
    nextFlow: [],
    nextFlowCondition: '개발 완료시',
    doCondition: '기능 구현 및 테스트',
    activateConditionType: 'all',
    activateCondition: ['node-1'],
  },
];

export const workflowConnectionMock = [
  {
    id: 'connection-1',
    from: 'node-1',
    to: 'node-2',
  },
];
