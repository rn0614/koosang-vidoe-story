// contexts/WorkflowContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import type { WorkflowNode, WorkflowConnection, WorkflowNodeState } from '@/shared/types/workflow';

interface WorkflowContextType {
  updateNode: (nodeId: string, updatedData: Partial<WorkflowNode>) => void;
  handleStatusChange: (nodeId: string, status: WorkflowNodeState) => void;
  addNode: () => void;
  deleteNode: (nodeId: string) => void;
  addConnection: (from: string, to: string) => void;
  removeConnection: (from: string, to: string) => void;
  // 선택적 구독을 위한 셀렉터들
  getNode: (nodeId: string) => WorkflowNode | undefined;
  getRelatedNodes: (nodeId: string) => WorkflowNode[];
  getAllNodeIds: () => string[];
  getConnections: () => WorkflowConnection[];
  replaceAll: (nodes: WorkflowNode[], connections: WorkflowConnection[]) => void;
  subscribeToNode: (nodeId: string, callback: () => void) => () => void;
  currentTemplateId: number | null;
  setCurrentTemplateId: (id: number | null) => void;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

interface WorkflowProviderProps {
  children: React.ReactNode;
  initialNodes?: WorkflowNode[];
  initialConnections?: WorkflowConnection[];
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({
  children,
  initialNodes = [],
  initialConnections = []
}) => {
  console.log('[RENDER] WorkflowProvider');
  // Map으로 노드 관리 (성능 최적화)
  const [nodesMap, setNodesMap] = useState<Map<string, WorkflowNode>>(() => 
    new Map(initialNodes.map(node => [node.id, node]))
  );
  
  const [connections, setConnections] = useState<WorkflowConnection[]>(initialConnections);
  const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null);
  
  // 구독자 관리 (Observer 패턴)
  const nodeSubscribers = useRef<Map<string, Set<() => void>>>(new Map());
  
  // 노드 구독/해제
  const subscribeToNode = useCallback((nodeId: string, callback: () => void) => {
    if (!nodeSubscribers.current.has(nodeId)) {
      nodeSubscribers.current.set(nodeId, new Set());
    }
    nodeSubscribers.current.get(nodeId)!.add(callback);
    
    return () => {
      nodeSubscribers.current.get(nodeId)?.delete(callback);
    };
  }, []);
  
  // 관련 노드들에게 알림
  const notifyNodeSubscribers = useCallback((nodeIds: string[]) => {
    nodeIds.forEach(nodeId => {
      nodeSubscribers.current.get(nodeId)?.forEach(callback => callback());
    });
  }, []);
  
  // 활성화 조건 체크
  const checkActivationCondition = useCallback((nodeId: string, nodesMap: Map<string, WorkflowNode>) => {
    const node = nodesMap.get(nodeId);
    if (!node || node.state !== 'wait') return false;
    
    const requiredIds = node.activateCondition || [];
    if (requiredIds.length === 0) return false;
    
    if (node.activateConditionType === 'all') {
      return requiredIds.every(id => nodesMap.get(id)?.state === 'complete');
    } else {
      return requiredIds.some(id => nodesMap.get(id)?.state === 'complete');
    }
  }, []);
  
  // 노드 업데이트
  const updateNode = useCallback((nodeId: string, updatedData: Partial<WorkflowNode>) => {
    console.debug('[USER_ACTION] 노드 업데이트', { nodeId, updatedData });
    
    setNodesMap(prev => {
      const newMap = new Map(prev);
      const existingNode = newMap.get(nodeId);
      if (!existingNode) return prev;
      
      const prevState = existingNode.state;
      const nextState = updatedData.state ?? prevState;

      newMap.set(nodeId, { ...existingNode, ...updatedData });

      // 상태가 do → complete로 바뀌는 경우 다음 노드 활성화 체크
      if (prevState === 'do' && nextState === 'complete') {
        (existingNode.nextFlow || []).forEach(nextId => {
          const shouldActivate = checkActivationCondition(nextId, newMap);
          const nextNode = newMap.get(nextId);
          if (shouldActivate && nextNode) {
            // 다음 노드 활성화
            newMap.set(nextId, { ...nextNode, state: 'do' });

            // any 조건일 때 나머지 이전 노드들 close 처리
            if (nextNode.activateConditionType === 'any') {
              const prevIds = nextNode.activateCondition || [];
              prevIds.forEach(prevId => {
                if (prevId !== nodeId) {
                  const prevNode = newMap.get(prevId);
                  if (prevNode && prevNode.state !== 'complete' && prevNode.state !== 'close') {
                    newMap.set(prevId, { ...prevNode, state: 'close' });
                  }
                }
              });
            }
          }
        });
      }
      
      return newMap;
    });
    
    // 해당 노드 구독자들에게 알림
    notifyNodeSubscribers([nodeId]);
  }, [checkActivationCondition, notifyNodeSubscribers]);
  
  // 상태 변경 처리 (Observer 패턴 적용)
  const handleStatusChange = useCallback((nodeId: string, status: WorkflowNodeState) => {
    console.debug('[USER_ACTION] 노드 상태 변경', { nodeId, status });
    
    setNodesMap(prev => {
      const currentNode = prev.get(nodeId);
      if (!currentNode || currentNode.state !== 'do') return prev;
      
      const newMap = new Map(prev);
      
      // 현재 노드 상태 업데이트
      newMap.set(nodeId, { ...currentNode, state: status });
      
      // 다음 노드들 활성화 체크 (complete인 경우만)
      if (status === 'complete') {
        const affectedNodeIds = [nodeId];
        
        (currentNode.nextFlow || []).forEach(nextId => {
          const shouldActivate = checkActivationCondition(nextId, newMap);
          if (shouldActivate) {
            const nextNode = newMap.get(nextId);
            if (nextNode) {
              newMap.set(nextId, { ...nextNode, state: 'do' });
              affectedNodeIds.push(nextId);
            }
          }
        });
        
        // 영향받은 노드들에게 알림
        setTimeout(() => notifyNodeSubscribers(affectedNodeIds), 0);
        
        // API 호출
        if (currentNode.onCompleteApi) {
          const { url, method, body, authentication } = currentNode.onCompleteApi;
          console.debug('[USER_ACTION] 노드 완료시 API 호출', { url, method, body });
          fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(authentication ? { Authorization: `Bearer ${authentication}` } : {}),
            },
            ...(method === 'POST' || method === 'PUT' ? { body: JSON.stringify(body) } : {}),
          }).catch(console.error);
        }
      } else {
        // 다른 상태 변경시에도 해당 노드 구독자들에게 알림
        setTimeout(() => notifyNodeSubscribers([nodeId]), 0);
      }
      
      return newMap;
    });
  }, [checkActivationCondition, notifyNodeSubscribers]);
  
  // 새 노드 추가
  const addNode = useCallback(() => {
    const scrollX = window.scrollX || document.documentElement.scrollLeft || 0;
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const centerX = scrollX + window.innerWidth / 2;
    const centerY = scrollY + window.innerHeight / 2;
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
    setNodesMap(prev => new Map(prev).set(newId, newNode));
  }, []);
  
  // 노드 삭제
  const deleteNode = useCallback((nodeId: string) => {
    console.debug('[USER_ACTION] 노드 삭제', { nodeId });
    
    setNodesMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(nodeId);
      
      // 다른 노드들의 연결 정보에서 삭제된 노드 제거
      newMap.forEach((node, id) => {
        const updatedNode = {
          ...node,
          frontFlow: (node.frontFlow || []).filter(id => id !== nodeId),
          nextFlow: (node.nextFlow || []).filter(id => id !== nodeId),
          activateCondition: (node.activateCondition || []).filter(id => id !== nodeId),
        };
        newMap.set(id, updatedNode);
      });
      
      return newMap;
    });
    
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
  }, []);
  
  // 연결 추가
  const addConnection = useCallback((from: string, to: string) => {
    setConnections(prev => {
      const exists = prev.some(conn => conn.from === from && conn.to === to);
      if (exists) return prev;
      return [...prev, { from, to }];
    });
    
    setNodesMap(prev => {
      const newMap = new Map(prev);
      
      // from 노드의 nextFlow 업데이트
      const fromNode = newMap.get(from);
      if (fromNode) {
        newMap.set(from, {
          ...fromNode,
          nextFlow: [...(fromNode.nextFlow || []), to],
        });
      }
      
      // to 노드의 frontFlow 및 activateCondition 업데이트
      const toNode = newMap.get(to);
      if (toNode) {
        newMap.set(to, {
          ...toNode,
          frontFlow: [...(toNode.frontFlow || []), from],
          activateCondition: Array.from(new Set([...(toNode.activateCondition || []), from])),
        });
      }
      
      return newMap;
    });
  }, []);
  
  // 연결 제거
  const removeConnection = useCallback((from: string, to: string) => {
    setConnections(prev => prev.filter(conn => !(conn.from === from && conn.to === to)));
    
    setNodesMap(prev => {
      const newMap = new Map(prev);
      
      // from 노드의 nextFlow에서 제거
      const fromNode = newMap.get(from);
      if (fromNode) {
        newMap.set(from, {
          ...fromNode,
          nextFlow: (fromNode.nextFlow || []).filter(id => id !== to),
        });
      }
      
      // to 노드의 frontFlow에서 제거
      const toNode = newMap.get(to);
      if (toNode) {
        newMap.set(to, {
          ...toNode,
          frontFlow: (toNode.frontFlow || []).filter(id => id !== from),
        });
      }
      
      return newMap;
    });
  }, []);
  
  // 전체 노드/연결 교체
  const replaceAll = useCallback((nodes: WorkflowNode[], connections: WorkflowConnection[]) => {
    setNodesMap(new Map(nodes.map(node => [node.id, node])));
    setConnections(connections);
  }, []);
  
  // 셀렉터들 useCallback으로 감싸기
  const getNode = useCallback((nodeId: string) => nodesMap.get(nodeId), [nodesMap]);
  const getAllNodeIds = useCallback(() => Array.from(nodesMap.keys()), [nodesMap]);
  const getConnections = useCallback(() => connections, [connections]);
  const getRelatedNodes = useCallback((nodeId: string) => {
    const node = nodesMap.get(nodeId);
    if (!node) return [];
    const relatedIds = [
      ...(node.frontFlow || []),
      ...(node.nextFlow || [])
    ];
    return relatedIds.map(id => nodesMap.get(id)).filter(Boolean) as WorkflowNode[];
  }, [nodesMap]);

  // contextValue에서 nodesMap, connections 제거, 셀렉터는 useCallback 사용
  const contextValue = useMemo<WorkflowContextType>(() => ({
    updateNode,
    handleStatusChange,
    addNode,
    deleteNode,
    addConnection,
    removeConnection,
    replaceAll,
    getNode,
    getRelatedNodes,
    getAllNodeIds,
    getConnections,
    subscribeToNode,
    currentTemplateId,
    setCurrentTemplateId,
  }), [
    updateNode, handleStatusChange, addNode, deleteNode, 
    addConnection, removeConnection, replaceAll, subscribeToNode,
    getNode, getRelatedNodes, getAllNodeIds, getConnections,
    currentTemplateId, setCurrentTemplateId
  ]);
  
  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
};

// 선택적 구독 훅들
export const useWorkflowContext = () => {
const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowContext must be used within WorkflowProvider');
  }
  return context;
};

export const useNodeSelector = (nodeId: string) => {
  const { getNode } = useWorkflowContext();
  const [node, setNode] = useState(() => getNode(nodeId));
  const { subscribeToNode } = React.useContext(WorkflowContext)!;

  React.useEffect(() => {
    setNode(getNode(nodeId));
    const unsubscribe = subscribeToNode(nodeId, () => {
      setNode(getNode(nodeId));
    });
    return () => {
      unsubscribe();
    };
  }, [nodeId, getNode, subscribeToNode]);

  if (!node) {
    // 최소한의 렌더링만 반환 (훅은 위에서 항상 실행)
    return <div style={{display: 'none'}} />;
  }

  return node;
};

export const useRelatedNodes = (nodeId: string) => {
  const { getRelatedNodes } = useWorkflowContext();
  return useMemo(() => getRelatedNodes(nodeId), [nodeId, getRelatedNodes]);
};

export const useAllNodeIds = () => {
  const { getAllNodeIds } = useWorkflowContext();
  const [nodeIds, setNodeIds] = useState(() => getAllNodeIds());
  
  // 노드 목록 변경 감지
  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentNodeIds = getAllNodeIds();
      setNodeIds(prev => {
        if (prev.length !== currentNodeIds.length) return currentNodeIds;
        if (prev.some((id, index) => id !== currentNodeIds[index])) return currentNodeIds;
        return prev;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [getAllNodeIds]);
  
  return nodeIds;
};