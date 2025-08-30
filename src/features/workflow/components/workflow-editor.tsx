// features/workflow/components/workflow-editor.tsx
'use client';
import React, { useState } from 'react';
import { WorkflowCanvas, StateExplanation } from '@/widgets/workflow';
import { TemplateManager } from './template-manager';
import { WorkflowProvider } from '../context';

interface WorkflowEditorProps {
  initialNodes?: any[];
  initialConnections?: any[];
  className?: string;
}

const WorkflowEditorContent = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState('');

  return (
    <div className="w-full h-full overflow-hidden bg-gray-100">
      {/* 헤더 */}
      <div className="w-full border-b bg-white p-4 shadow-sm">
        <TemplateManager
          workflowTitle={workflowTitle}
          onTitleChange={setWorkflowTitle}
        />
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

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  initialNodes = [],
  initialConnections = [],
  className = '',
}) => {
  return (
    <div className={className}>
      <WorkflowProvider 
        initialNodes={initialNodes}
        initialConnections={initialConnections}
      >
        <WorkflowEditorContent />
      </WorkflowProvider>
    </div>
  );
};
