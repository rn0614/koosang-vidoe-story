// features/workflow exports
export { default as FlowNode } from './components/FlowNode';
export { Connection, TempConnection } from './components/Connection';
export { TemplateManager } from './components/template-manager';
export { WorkflowEditor } from './components/workflow-editor';

// Context & Store
export { WorkflowProvider, useWorkflowTemplate, useWorkflowStore } from './context';

// Hooks
export { useConnectionDrag } from './hooks/useConnectionDrag';
export { useNodeDrag } from './hooks/useNodeDrag';
export { useTemplateManager } from './hooks/useTemplateManager';

// Store
export { createWorkflowStore, type WorkflowStore } from './store';

// Types
export type * from './types';

// API
export { templateApi, workflowApi, nodeApi } from './api';

// Utils
export { activationRules } from './lib/activation-rules';
export { nodeFactory } from './lib/node-factory';