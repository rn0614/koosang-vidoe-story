// features/workflow/context.tsx - Context for template management + Zustand store provider
import React, { createContext, useContext, useState, useMemo } from 'react';
import type { WorkflowNode, WorkflowConnection } from './types';
import { createWorkflowStore, type WorkflowStore } from './store';

// Template management context
interface WorkflowTemplateContextType {
  currentTemplateId: number | null;
  setCurrentTemplateId: (id: number | null) => void;
}

// Store context
interface WorkflowStoreContextType {
  store: WorkflowStore;
}

const WorkflowTemplateContext = createContext<WorkflowTemplateContextType | null>(null);
const WorkflowStoreContext = createContext<WorkflowStoreContextType | null>(null);

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
  // ✅ 좋은 방법 - 자동 정리 - 컴포넌트 언마운트 시 자동으로 정리됨
  const [store] = useState(() => createWorkflowStore(initialNodes, initialConnections));
  
  // Template management state
  const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null);

  // Memoized context values
  const templateValue = useMemo(() => ({
    currentTemplateId,
    setCurrentTemplateId,
  }), [currentTemplateId, setCurrentTemplateId]);

  const storeValue = useMemo(() => ({
    store,
  }), [store]);

  return (
    <WorkflowStoreContext.Provider value={storeValue}>
      <WorkflowTemplateContext.Provider value={templateValue}>
        {children}
      </WorkflowTemplateContext.Provider>
    </WorkflowStoreContext.Provider>
  );
};

// Hook exports
export const useWorkflowTemplate = () => {
  const context = useContext(WorkflowTemplateContext);
  if (!context) {
    throw new Error('useWorkflowTemplate must be used within WorkflowProvider');
  }
  return context;
};

export const useWorkflowStore = () => {
  const context = useContext(WorkflowStoreContext);
  if (!context) {
    throw new Error('useWorkflowStore must be used within WorkflowProvider');
  }
  return context.store;
};