// widgets/workflow/node-layer.tsx
import React from 'react';
import FlowNode from '@/features/workflow/components/FlowNode';
import type { WorkflowNodeState, DragState } from '@/features/workflow/types';

interface NodeLayerProps {
  visibleNodeIds: string[];
  getNode: (nodeId: string) => any;
  selectedNodeId: string | null;
  dragState: DragState;
  ghostPosition: { x: number; y: number } | null; // ✅ Ghost 위치
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
  ghostPosition, // ✅ Ghost 위치
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
        
        const isDragging = dragState.isDragging && dragState.dragNodeId === nodeId;
        
        // console.log(`[NODE_LAYER] Rendering ${nodeId} - isDragging: ${isDragging}, ghostPosition:`, ghostPosition);
        
        return (
          <React.Fragment key={nodeId}>
            {/* ✅ 원래 위치의 노드 (드래그 중이면 반투명) */}
            <div data-node={nodeId}>
              <FlowNode
                nodeId={nodeId}
                onNodeSelect={onNodeSelect}
                onConnectionStart={onConnectionStart}
                onDragStart={onDragStart}
                onStatusChange={onStatusChange}
                isSelected={selectedNodeId === nodeId}
                isDragging={isDragging}
                onNodeDelete={onNodeDelete}
                isGhost={false}
              />
            </div>
            
            {/* ✅ Ghost 노드 (드래그 중일 때만 렌더링) */}
            {isDragging && ghostPosition && (
              <div data-node={`${nodeId}-ghost`} style={{ position: 'relative', zIndex: 10000 }}>
                {/* {console.log(`[GHOST_RENDER] NodeLayer - nodeId: ${nodeId}, isDragging: ${isDragging}, ghostPosition:`, ghostPosition)} */}
                <FlowNode
                  nodeId={nodeId}
                  onNodeSelect={onNodeSelect}
                  onConnectionStart={onConnectionStart}
                  onDragStart={onDragStart}
                  onStatusChange={onStatusChange}
                  isSelected={false}
                  isDragging={false}
                  onNodeDelete={onNodeDelete}
                  isGhost={true}
                  ghostPosition={ghostPosition}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
