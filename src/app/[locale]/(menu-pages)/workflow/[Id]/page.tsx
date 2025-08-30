// app/workflow/template/page.tsx - Template Editor Page
'use client';
import React from 'react';
import { workflowApi, WorkflowEditor } from '@/features/workflow';
import {
  workflowConnectionMock,
  workflowNodeMock,
} from '@/__mocks__/work-flow.mock';
import { useParams } from 'next/navigation';

const WorkflowIdPage = async ({ params }: { params: { id: number }} ) => {
  
  //const fetchedTemplates = await workflowApi.getWorkflowList();
  return (
    <WorkflowEditor
      initialNodes={workflowNodeMock}
      initialConnections={workflowConnectionMock}
      className="h-full w-full"
    />
  );
};

export default WorkflowIdPage;
