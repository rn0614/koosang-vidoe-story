// components/workflow/FlowNode.tsx
import React, { useState, useRef, useLayoutEffect } from 'react';
import { Settings, Play, CheckCircle, Circle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { DialogFooter } from '@/shared/ui/dialog';
import { WorkflowNode, WorkflowNodeState } from '../types';
import { logUserAction } from '@/shared/lib/logger';
import { useWorkflowStore } from '../context';
import { Button } from '@/shared/ui/button';

// 노드 상태에 따른 색상 정의
const getNodeStateColor = (state: WorkflowNodeState) => {
  switch (state) {
    case 'wait':
      return 'border-yellow-400 bg-yellow-50';
    case 'do':
      return 'border-blue-400 bg-blue-50';
    case 'complete':
      return 'border-gray-400 bg-gray-50';
    case 'fail':
      return 'border-red-400 bg-red-50';
    case 'close':
      return 'border-gray-300 bg-gray-200 opacity-60';
    default:
      return 'border-gray-300 bg-white';
  }
};

// 노드 상태 아이콘
const getStateIcon = (state: WorkflowNodeState) => {
  switch (state) {
    case 'wait':
      return <Circle className="h-4 w-4 text-yellow-500" />;
    case 'do':
      return <Play className="h-4 w-4 text-blue-500" />;
    case 'complete':
      return <CheckCircle className="h-4 w-4 text-gray-500" />;
    case 'fail':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'close':
      return <Circle className="h-4 w-4 text-gray-400 opacity-60" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

type FlowNodeProps = {
  nodeId: string; // 🎯 ID만 받음!
  onNodeSelect: (nodeId: string) => void;
  onConnectionStart: (nodeId: string, e: React.MouseEvent) => void;
  isSelected: boolean;
  isDragging: boolean;
  dragOffset?: { x: number; y: number };
  isGhost?: boolean;
  ghostPosition?: { x: number; y: number };
  onDragStart: (nodeId: string, e: React.MouseEvent) => void;
  onStatusChange: (nodeId: string, status: WorkflowNodeState) => void;
  onNodeDelete: (nodeId: string) => void;
};

// 개별 노드 컴포넌트 - 최적화됨
const FlowNode = ({
  nodeId,
  onNodeSelect,
  onConnectionStart,
  isSelected,
  isDragging,
  dragOffset,
  isGhost = false,
  ghostPosition,
  onDragStart,
  onStatusChange,
  onNodeDelete,
}: FlowNodeProps) => {
  // console.log(`[RENDER] FlowNode ${nodeId} - isGhost: ${isGhost}, ghostPosition:`, ghostPosition);
  
  // Zustand store 구독 - 해당 노드만 선택적으로 구독
  const store = useWorkflowStore();
  const node = store((state) => state.getNode(nodeId)) as WorkflowNode;
  const updateNode = store((state) => state.updateNode);
  const getNode = store((state) => state.getNode);

  const [isEditing, setIsEditing] = useState(false);
  if (!node) return null;

  const [editData, setEditData] = useState<WorkflowNode>(() => ({
    id: nodeId,
    title: '',
    role: '',
    state: 'wait',
    x: 0,
    y: 0,
    frontFlow: [],
    nextFlow: [],
    nextFlowCondition: '',
    doCondition: '',
    activateConditionType: 'all',
    activateCondition: [],
  }));
  const [showDropdown, setShowDropdown] = useState(false);
  const nodeRef = useRef(null);

  // 노드 크기 상수
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 150;

  const handleSave = () => {
    updateNode(nodeId, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...node }); // 최신 노드 데이터로 복원
    setIsEditing(false);
  };

  // 모달이 열릴 때마다 최신 노드 데이터로 editData 업데이트
  useLayoutEffect(() => {
    if (isEditing && node) {
      setEditData({ ...node });
    }
  }, [isEditing, node]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.connection-point')) return;
    if (target.closest('.status-dropdown')) return;
    if (isEditing) return;
    logUserAction('노드 드래그 시작', { nodeId });
    onDragStart(nodeId, e);
  };

  const handleStatusChange = (status: WorkflowNodeState) => {
    setShowDropdown(false);
    updateNode(nodeId, { state: status });
  };

  return (
    <>
      <div
        ref={nodeRef}
        className={`relative min-w-[200px] cursor-move select-none rounded-lg border-2 bg-white p-4 shadow-md ${getNodeStateColor(node.state)} ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isDragging && !isGhost ? 'z-50 opacity-30' : ''} ${isGhost ? 'pointer-events-none z-[9999] opacity-80' : ''} hover:shadow-lg`}
        style={{
          position: 'absolute',
          left: isGhost && ghostPosition ? ghostPosition.x : node.x,
          top: isGhost && ghostPosition ? ghostPosition.y : node.y,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          transform:
            isDragging && dragOffset && !isGhost
              ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
              : undefined,
          boxShadow: isGhost
            ? '0 0 0 2px #3B82F6, 0 8px 24px rgba(59,130,246,0.15)'
            : undefined,
        }}
        onMouseDown={isGhost ? undefined : handleMouseDown}
        onClick={
          isGhost
            ? undefined
            : () => {
                logUserAction('노드 선택', { nodeId });
                onNodeSelect(nodeId);
              }
        }
      >
        {/* 연결점 - 입력 */}
        <div
          className="connection-point absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform cursor-crosshair rounded-full border-2 border-white bg-green-500 shadow-md hover:scale-110"
          data-type="input"
          data-node-id={nodeId}
        />

        {/* 연결점 - 출력 */}
        <div
          className="connection-point absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 transform cursor-crosshair rounded-full border-2 border-white bg-blue-500 shadow-md hover:scale-110"
          data-type="output"
          data-node-id={nodeId}
          onMouseDown={(e) => {
            e.stopPropagation();
            onConnectionStart(nodeId, e);
          }}
        />

        <div className="mb-2 flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
            {getStateIcon(node.state)}
            <h3 className="truncate font-semibold text-gray-800">
              {node.title}
            </h3>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button
                  onClick={(e) => {
                    logUserAction('노드 편집 열기', { nodeId });
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="rounded p-1 hover:bg-gray-200"
                >
                  <Settings className="h-4 w-4 text-white-500" />
                </Button>
              </DialogTrigger>
              <DialogContent
                onPointerDownOutside={(e) => e.preventDefault()}
                className="w-full max-w-md"
              >
                <DialogHeader>
                  <DialogTitle>노드 편집</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) =>
                        setEditData({ ...editData, title: e.target.value })
                      }
                      className="w-full rounded-md border p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <input
                      type="text"
                      value={editData.role}
                      onChange={(e) =>
                        setEditData({ ...editData, role: e.target.value })
                      }
                      className="w-full rounded-md border p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <select
                      value={editData.state}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          state: e.target.value as WorkflowNodeState,
                        })
                      }
                      className="w-full rounded-md border p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="wait">대기중 (1)</option>
                      <option value="do">진행중 (2)</option>
                      <option value="complete">완료 (3)</option>
                      <option value="fail">실패</option>
                      <option value="close">종료</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Do Condition
                    </label>
                    <textarea
                      value={editData.doCondition}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          doCondition: e.target.value,
                        })
                      }
                      className="w-full rounded-md border p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Next Flow Condition
                    </label>
                    <textarea
                      value={editData.nextFlowCondition}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          nextFlowCondition: e.target.value,
                        })
                      }
                      className="w-full rounded-md border p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Activate Condition Type
                    </label>
                    <select
                      value={editData.activateConditionType}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          activateConditionType: e.target.value as
                            | 'any'
                            | 'all',
                        })
                      }
                      className="w-full rounded-md border p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="all">All</option>
                      <option value="any">Any</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Activate Condition
                    </label>
                    <div className="flex flex-col gap-1">
                      {(node.frontFlow || []).map((prevId) => {
                        const prevNode = getNode(prevId);
                        return (
                          <div
                            key={prevId}
                            className="flex items-center gap-3 py-1"
                          >
                            <input
                              type="checkbox"
                              checked={
                                !!(editData.activateCondition || []).includes(
                                  prevId,
                                )
                              }
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setEditData((prev) => {
                                  const prevList = prev.activateCondition || [];
                                  return {
                                    ...prev,
                                    activateCondition: checked
                                      ? [...prevList, prevId]
                                      : prevList.filter((id) => id !== prevId),
                                  };
                                });
                              }}
                              id={`activate-${prevId}`}
                            />
                            <label
                              htmlFor={`activate-${prevId}`}
                              className="ml-2 cursor-pointer select-none text-sm font-semibold text-gray-900"
                            >
                              {prevNode?.title || prevId}
                            </label>
                          </div>
                        );
                      })}
                      {(!node.frontFlow || node.frontFlow.length === 0) && (
                        <span className="text-xs text-gray-400">
                          이전 노드가 없습니다.
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      완료 시 API 호출 URL
                    </label>
                    <input
                      type="text"
                      value={editData.onCompleteApi?.url || ''}
                      onChange={(e) => {
                        setEditData((prev) => ({
                          ...prev,
                          onCompleteApi: {
                            url: e.target.value,
                            method: prev.onCompleteApi?.method || 'POST',
                            body: prev.onCompleteApi?.body || '',
                            authentication: prev.onCompleteApi?.authentication,
                          },
                        }));
                      }}
                      className="w-full rounded-md border p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="https://api.example.com/endpoint"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      완료 시 API Body (JSON)
                    </label>
                    <textarea
                      value={editData.onCompleteApi?.body || ''}
                      onChange={(e) => {
                        setEditData((prev) => ({
                          ...prev,
                          onCompleteApi: {
                            url: prev.onCompleteApi?.url || '',
                            method: prev.onCompleteApi?.method || 'POST',
                            body: e.target.value,
                            authentication: prev.onCompleteApi?.authentication,
                          },
                        }));
                      }}
                      className="w-full rounded-md border p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={`{\n  \"key\": \"value\"\n}`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6 flex gap-2">
                  <Button
                    onClick={(e) => {
                      logUserAction('노드 편집 저장', { nodeId, editData });
                      e.stopPropagation();
                      handleSave();
                    }}
                  >
                    저장
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel();
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('정말 이 노드를 삭제하시겠습니까?')) {
                        onNodeDelete(nodeId);
                        setIsEditing(false);
                      }
                    }}
                  >
                    삭제
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-2 overflow-hidden text-sm">
          <div className="pr-2">
            <span className="font-medium text-gray-600">Role:</span>
            <span className="ml-2 truncate rounded bg-purple-100 px-2 py-1 text-xs text-purple-800">
              {node.role}
            </span>
          </div>

          {/* 상태 변경 드롭다운을 role 아래로 이동 */}
          {node.state === 'do' && (
            <div className="status-dropdown relative pr-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
              >
                완료/실패
              </Button>
            </div>
          )}
        </div>

        {node.state === 'do' && showDropdown && (
          <div
            className="absolute left-4 z-50 min-w-[80px] rounded-md border bg-white shadow-lg"
            style={{
              top: `${NODE_HEIGHT - 40}px`,
            }}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('complete');
              }}
            >
              완료
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('fail');
              }}
            >
              실패
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

// 🚀 React.memo로 최적화 - 세밀한 props 비교로 리렌더링 방지
export default React.memo(FlowNode, (prevProps, nextProps) => {
  // nodeId가 다르면 리렌더링 필요
  if (prevProps.nodeId !== nextProps.nodeId) return false;

  // 선택/드래그 상태가 다르면 리렌더링 필요
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.isDragging !== nextProps.isDragging) return false;

  // ✅ Ghost 관련 props 비교 추가
  if (prevProps.isGhost !== nextProps.isGhost) return false;
  if (prevProps.ghostPosition !== nextProps.ghostPosition) return false;

  // 다른 props들은 함수이므로 참조 비교만 함
  // (useCallback으로 안정화된 경우에만 동작)
  return (
    prevProps.onNodeSelect === nextProps.onNodeSelect &&
    prevProps.onConnectionStart === nextProps.onConnectionStart &&
    prevProps.onDragStart === nextProps.onDragStart &&
    prevProps.onStatusChange === nextProps.onStatusChange &&
    prevProps.onNodeDelete === nextProps.onNodeDelete
  );
});
