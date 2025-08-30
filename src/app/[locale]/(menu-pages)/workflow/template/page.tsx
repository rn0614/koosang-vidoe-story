// app/workflow/template/page.tsx - Template Editor Page
'use client';
import React from 'react';
import { WorkflowEditor } from '@/features/workflow';
import {
  workflowConnectionMock,
  workflowNodeMock,
} from '@/__mocks__/work-flow.mock';

const WorkflowTemplatePage = () => {
  return (
    <WorkflowEditor
      initialNodes={workflowNodeMock}
      initialConnections={workflowConnectionMock}
      className="h-full w-full"
    />
  );
};

export default WorkflowTemplatePage;
