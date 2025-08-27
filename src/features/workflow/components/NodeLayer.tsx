// components/workflow/NodeLayer.tsx
import React from 'react';
import FlowNode from '@/features/workflow/components/FlowNode';
import type { WorkflowNodeState, DragState } from '@/shared/types/workflow';

interface NodeLayerProps {
  visibleNodeIds: string[];
  getNode: (nodeId: string) => any;
  selectedNodeId: string | null;
  dragState: DragState;
  onNodeSelect: (nodeId: string) => void;
  onConnectionStart: (nodeId: string, e: React.MouseEvent) => void;
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onStatusChange: (nodeId: string, status: WorkflowNodeState) => void;
  onNodeDelete: (nodeId: string) => void;
}

export const NodeLayer: React.FC<NodeLayerProps> = ({
  visibleNodeIds,
  getNode,
  selectedNodeId,
  dragState,
  onNodeSelect,
  onConnectionStart,
  onDragStart,
  onStatusChange,
  onNodeDelete,
}) => {
  return (
    <>
      {visibleNodeIds.map(nodeId => {
        const node = getNode(nodeId);
        if (!node) return null;
        
        return (
          <div key={nodeId} data-node={nodeId}>
            <FlowNode
              nodeId={nodeId}
              onNodeSelect={onNodeSelect}
              onConnectionStart={onConnectionStart}
              onDragStart={onDragStart}
              onStatusChange={onStatusChange}
              isSelected={selectedNodeId === nodeId}
              isDragging={dragState.isDragging && dragState.dragNodeId === nodeId}
              onNodeDelete={onNodeDelete}
            />
          </div>
        );
      })}
    </>
  );
};

