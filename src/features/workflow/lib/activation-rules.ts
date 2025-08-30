// features/workflow/lib/activation-rules.ts
import type { WorkflowNode, WorkflowNodeState } from '../types';

/**
 * 노드 활성화 조건을 체크하는 유틸리티
 */
export const activationRules = {
  /**
   * 노드가 활성화 조건을 만족하는지 확인
   */
  checkActivationCondition(
    nodeId: string, 
    nodesMap: Map<string, WorkflowNode>
  ): boolean {
    const node = nodesMap.get(nodeId);
    if (!node || node.state !== 'wait') return false;
    
    const requiredIds = node.activateCondition || [];
    if (requiredIds.length === 0) return false;
    
    if (node.activateConditionType === 'all') {
      return requiredIds.every(id => nodesMap.get(id)?.state === 'complete');
    } else {
      return requiredIds.some(id => nodesMap.get(id)?.state === 'complete');
    }
  },

  /**
   * 노드 완료 시 다음 노드들을 활성화하고 새로운 노드 맵 반환
   */
  activateNextNodes(
    completedNodeId: string,
    nodesMap: Map<string, WorkflowNode>
  ): {
    newMap: Map<string, WorkflowNode>;
    affectedNodeIds: string[];
  } {
    const newMap = new Map(nodesMap);
    const completedNode = newMap.get(completedNodeId);
    const affectedNodeIds = [completedNodeId];
    
    if (!completedNode) return { newMap, affectedNodeIds };

    // 다음 노드들 활성화 체크
    (completedNode.nextFlow || []).forEach(nextId => {
      const shouldActivate = this.checkActivationCondition(nextId, newMap);
      const nextNode = newMap.get(nextId);
      
      if (shouldActivate && nextNode) {
        // 다음 노드 활성화
        newMap.set(nextId, { ...nextNode, state: 'do' });
        affectedNodeIds.push(nextId);

        // any 조건일 때 나머지 이전 노드들 close 처리
        if (nextNode.activateConditionType === 'any') {
          const prevIds = nextNode.activateCondition || [];
          prevIds.forEach(prevId => {
            if (prevId !== completedNodeId) {
              const prevNode = newMap.get(prevId);
              if (prevNode && prevNode.state !== 'complete' && prevNode.state !== 'close') {
                newMap.set(prevId, { ...prevNode, state: 'close' });
                affectedNodeIds.push(prevId);
              }
            }
          });
        }
      }
    });

    return { newMap, affectedNodeIds };
  },

  /**
   * 노드가 삭제될 때 관련된 다른 노드들의 연결 정보 정리
   */
  cleanupNodeConnections(
    deletedNodeId: string,
    nodesMap: Map<string, WorkflowNode>
  ): Map<string, WorkflowNode> {
    const newMap = new Map(nodesMap);
    newMap.delete(deletedNodeId);
    
    // 다른 노드들의 연결 정보에서 삭제된 노드 제거
    newMap.forEach((node, id) => {
      const updatedNode = {
        ...node,
        frontFlow: (node.frontFlow || []).filter(nodeId => nodeId !== deletedNodeId),
        nextFlow: (node.nextFlow || []).filter(nodeId => nodeId !== deletedNodeId),
        activateCondition: (node.activateCondition || []).filter(nodeId => nodeId !== deletedNodeId),
      };
      newMap.set(id, updatedNode);
    });
    
    return newMap;
  },
};
