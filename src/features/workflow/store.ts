// features/workflow/store.ts - Zustand store for workflow state
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { WorkflowNode, WorkflowConnection, WorkflowNodeState } from './types';
import { activationRules } from './lib/activation-rules';
import { nodeFactory } from './lib/node-factory';
import { nodeApi } from './api/nodeApi';
import { logUserAction } from '@/shared/lib/logger';

interface WorkflowState {
  // State
  nodes: Map<string, WorkflowNode>;
  connections: WorkflowConnection[];
  nodeIds: string[]; // ✅ 캐시된 노드 ID 배열
  connectionVersion: number; // ✅ Connection 리렌더링 트리거용
  
  // Node operations
  addNode: () => void;
  updateNode: (nodeId: string, updatedData: Partial<WorkflowNode>) => void;
  deleteNode: (nodeId: string) => void;
  getNode: (nodeId: string) => WorkflowNode | undefined;
  getAllNodeIds: () => string[];
  
  // Connection operations
  addConnection: (from: string, to: string) => void;
  removeConnection: (from: string, to: string) => void;
  getConnections: () => WorkflowConnection[];
  
  // Status operations
  handleStatusChange: (nodeId: string, status: WorkflowNodeState) => void;
  
  // Bulk operations
  replaceAll: (nodes: WorkflowNode[], connections: WorkflowConnection[]) => void;
  
  // Helper getters
  getRelatedNodes: (nodeId: string) => WorkflowNode[];
}

export const createWorkflowStore = (
  initialNodes: WorkflowNode[] = [],
  initialConnections: WorkflowConnection[] = []
) => {
  return create<WorkflowState>()(
    subscribeWithSelector((set, get) => ({
      // Initial state
      nodes: new Map(initialNodes.map(node => [node.id, node])),
      connections: initialConnections,
      nodeIds: initialNodes.map(node => node.id), // ✅ 초기 노드 ID 배열
      connectionVersion: 0, // ✅ Connection 버전 초기화

      // Node operations
      addNode: () => {
        const newNode = nodeFactory.createNode();
        logUserAction('노드 추가', newNode);
        
        set((state) => ({
          nodes: new Map(state.nodes).set(newNode.id, newNode),
          nodeIds: [...state.nodeIds, newNode.id], // ✅ 노드 ID 배열 업데이트
        }));
      },

      updateNode: (nodeId: string, updatedData: Partial<WorkflowNode>) => {
        logUserAction('노드 업데이트', { nodeId, updatedData });
        
        set((state) => {
          const newNodes = new Map(state.nodes);
          const existingNode = newNodes.get(nodeId);
          if (!existingNode) return state;
          
          const prevState = existingNode.state;
          const nextState = updatedData.state ?? prevState;
          
          // 위치가 변경되는지 확인
          const isPositionChange = 'x' in updatedData || 'y' in updatedData;
          
          newNodes.set(nodeId, { ...existingNode, ...updatedData });
          
          // 상태가 do → complete로 바뀌는 경우 다음 노드 활성화
          if (prevState === 'do' && nextState === 'complete') {
            const { newMap: updatedNodes } = activationRules.activateNextNodes(nodeId, newNodes);
            return { 
              nodes: updatedNodes,
              connectionVersion: state.connectionVersion + 1 // ✅ Connection 리렌더링 트리거
            };
          }
          
          // ✅ 노드 위치 변경 시 연결된 connection들 리렌더링 트리거
          if (isPositionChange) {
            return { 
              nodes: newNodes,
              connectionVersion: state.connectionVersion + 1
            };
          }
          
          return { nodes: newNodes };
        });
      },

      deleteNode: (nodeId: string) => {
        logUserAction('노드 삭제', { nodeId });
        
        set((state) => {
          const newNodes = activationRules.cleanupNodeConnections(nodeId, state.nodes);
          const newConnections = state.connections.filter(
            conn => conn.from !== nodeId && conn.to !== nodeId
          );
          
          return {
            nodes: newNodes,
            connections: newConnections,
            nodeIds: state.nodeIds.filter(id => id !== nodeId), // ✅ 노드 ID 배열에서 제거
            connectionVersion: state.connectionVersion + 1, // ✅ Connection 리렌더링 트리거
          };
        });
      },

      getNode: (nodeId: string) => get().nodes.get(nodeId),
      
      getAllNodeIds: () => get().nodeIds, // ✅ 캐시된 배열 반환

      // Connection operations
      addConnection: (from: string, to: string) => {
        set((state) => {
          // Check for duplicate
          const exists = state.connections.some(conn => conn.from === from && conn.to === to);
          if (exists) return state;
          
          const newNodes = new Map(state.nodes);
          const newConnections = [...state.connections, { from, to }];
          
          // Update from node's nextFlow
          const fromNode = newNodes.get(from);
          if (fromNode) {
            newNodes.set(from, {
              ...fromNode,
              nextFlow: [...(fromNode.nextFlow || []), to],
            });
          }
          
          // Update to node's frontFlow and activateCondition
          const toNode = newNodes.get(to);
          if (toNode) {
            newNodes.set(to, {
              ...toNode,
              frontFlow: [...(toNode.frontFlow || []), from],
              activateCondition: Array.from(new Set([...(toNode.activateCondition || []), from])),
            });
          }
          
          return {
            nodes: newNodes,
            connections: newConnections,
            connectionVersion: state.connectionVersion + 1, // ✅ Connection 리렌더링 트리거
          };
        });
      },

      removeConnection: (from: string, to: string) => {
        set((state) => {
          const newNodes = new Map(state.nodes);
          const newConnections = state.connections.filter(
            conn => !(conn.from === from && conn.to === to)
          );
          
          // Remove from nextFlow
          const fromNode = newNodes.get(from);
          if (fromNode) {
            newNodes.set(from, {
              ...fromNode,
              nextFlow: (fromNode.nextFlow || []).filter(id => id !== to),
            });
          }
          
          // Remove from frontFlow
          const toNode = newNodes.get(to);
          if (toNode) {
            newNodes.set(to, {
              ...toNode,
              frontFlow: (toNode.frontFlow || []).filter(id => id !== from),
            });
          }
          
          return {
            nodes: newNodes,
            connections: newConnections,
            connectionVersion: state.connectionVersion + 1, // ✅ Connection 리렌더링 트리거
          };
        });
      },

      getConnections: () => get().connections,

      // Status operations
      handleStatusChange: (nodeId: string, status: WorkflowNodeState) => {
        logUserAction('노드 상태 변경', { nodeId, status });
        
        set((state) => {
          const currentNode = state.nodes.get(nodeId);
          if (!currentNode || currentNode.state !== 'do') return state;
          
          const newNodes = new Map(state.nodes);
          newNodes.set(nodeId, { ...currentNode, state: status });
          
          if (status === 'complete') {
            const { newMap: updatedNodes } = activationRules.activateNextNodes(nodeId, newNodes);
            
            // API 호출 (비동기)
            if (currentNode.onCompleteApi) {
              nodeApi.callCompletionApi(currentNode.onCompleteApi).catch(console.error);
            }
            
            return { nodes: updatedNodes };
          }
          
          return { nodes: newNodes };
        });
      },

      // Bulk operations
      replaceAll: (nodes: WorkflowNode[], newConnections: WorkflowConnection[]) => {
        set({
          nodes: new Map(nodes.map(node => [node.id, node])),
          connections: newConnections,
          nodeIds: nodes.map(node => node.id), // ✅ 노드 ID 배열도 교체
          connectionVersion: 0, // ✅ Connection 버전 초기화
        });
      },

      // Helper getters
      getRelatedNodes: (nodeId: string) => {
        const node = get().nodes.get(nodeId);
        if (!node) return [];
        const relatedIds = [
          ...(node.frontFlow || []),
          ...(node.nextFlow || [])
        ];
        return relatedIds.map(id => get().nodes.get(id)).filter(Boolean) as WorkflowNode[];
      },
    }))
  );
};

export type WorkflowStore = ReturnType<typeof createWorkflowStore>;
