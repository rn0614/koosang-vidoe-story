// features/workflow/lib/node-factory.ts
import type { WorkflowNode } from '../types';

/**
 * 노드 생성 관련 유틸리티
 */
export const nodeFactory = {
  /**
   * 새 노드 생성
   */
  createNode(position?: { x: number; y: number }): WorkflowNode {
    const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const centerX = scrollX + window.innerWidth / 2;
    const centerY = scrollY + window.innerHeight / 2;
    
    const defaultPosition = {
      x: centerX - 100,
      y: centerY - 75,
    };

    return {
      id: `node-${Date.now()}`,
      title: '새 노드',
      role: 'User',
      state: 'wait',
      x: position?.x ?? defaultPosition.x,
      y: position?.y ?? defaultPosition.y,
      frontFlow: [],
      nextFlow: [],
      nextFlowCondition: '',
      doCondition: '',
      activateConditionType: 'all',
    };
  },

  /**
   * 노드 복사
   */
  cloneNode(node: WorkflowNode, newPosition?: { x: number; y: number }): WorkflowNode {
    return {
      ...node,
      id: `node-${Date.now()}`,
      title: `${node.title} (복사)`,
      x: newPosition?.x ?? node.x + 50,
      y: newPosition?.y ?? node.y + 50,
      state: 'wait', // 복사된 노드는 항상 대기 상태로
      frontFlow: [],
      nextFlow: [],
      activateCondition: [],
    };
  },

  /**
   * 노드 위치 업데이트
   */
  updateNodePosition(node: WorkflowNode, position: { x: number; y: number }): WorkflowNode {
    return {
      ...node,
      x: position.x,
      y: position.y,
    };
  },
};
