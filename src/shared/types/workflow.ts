export type WorkflowNodeState = 'wait' | 'do' | 'complete' | 'fail' | 'close';

export interface WorkflowNode {
  id: string;
  title: string;
  role: string;
  state: WorkflowNodeState;
  x: number;
  y: number;
  frontFlow: string[];
  nextFlow: string[];
  nextFlowCondition: string;
  doCondition: string;
  activateConditionType: 'any' | 'all';
  activateCondition?: string[];
  onCompleteApi?: {
    url: string;
    authentication?: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
  };
}

export interface WorkflowConnection {
  from: string;
  to: string;
}

export interface DragState {
  isDragging: boolean;
  dragNodeId: string | null;
  startPos: { x: number; y: number };
  offset: { x: number; y: number };
}

export interface ConnectionState {
  isConnecting: boolean;
  startNodeId: string | null;
  tempLine: { x: number; y: number } | null;
}
