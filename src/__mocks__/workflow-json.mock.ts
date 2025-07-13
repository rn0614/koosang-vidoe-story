import { Position, MarkerType } from 'reactflow';

export const workflowJsonMock = {
  nodes: [
    {
      id: '1',
      type: 'start',
      position: { x: 250, y: 25 },
      data: { label: '시작' },
      sourcePosition: Position.Bottom,
    },
    {
      id: '2',
      type: 'process',
      position: { x: 200, y: 125 },
      data: { label: '요청 접수' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: '3',
      type: 'decision',
      position: { x: 220, y: 225 },
      data: { label: '승인 필요?' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: '4',
      type: 'process',
      position: { x: 100, y: 325 },
      data: { label: '자동 처리' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: '5',
      type: 'process',
      position: { x: 340, y: 325 },
      data: { label: '승인 요청' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: '6',
      type: 'decision',
      position: { x: 340, y: 425 },
      data: { label: '승인 결과?' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: '7',
      type: 'process',
      position: { x: 200, y: 525 },
      data: { label: '후처리' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: '8',
      type: 'end',
      position: { x: 200, y: 625 },
      data: { label: '종료' },
      targetPosition: Position.Top,
    },
    {
      id: '9',
      type: 'process',
      position: { x: 500, y: 325 },
      data: { label: '이의 신청' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
    {
      id: '10',
      type: 'process',
      position: { x: 500, y: 425 },
      data: { label: '재심사' },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
    // decision(3) 분기: 승인 필요 없음(4), 승인 필요(5)
    { id: 'e3-4', source: '3', target: '4', markerEnd: { type: MarkerType.ArrowClosed }, label: '아니오' },
    { id: 'e3-5', source: '3', target: '5', markerEnd: { type: MarkerType.ArrowClosed }, label: '예' },
    // 승인 요청(5) → 승인 결과(6)
    { id: 'e5-6', source: '5', target: '6', markerEnd: { type: MarkerType.ArrowClosed } },
    // 승인 결과(6) 분기: 승인(7), 반려(9)
    { id: 'e6-7', source: '6', target: '7', markerEnd: { type: MarkerType.ArrowClosed }, label: '승인' },
    { id: 'e6-9', source: '6', target: '9', markerEnd: { type: MarkerType.ArrowClosed }, label: '반려' },
    // 자동 처리(4) → 후처리(7)
    { id: 'e4-7', source: '4', target: '7', markerEnd: { type: MarkerType.ArrowClosed } },
    // 이의 신청(9) → 재심사(10) → 승인 결과(6) (루프)
    { id: 'e9-10', source: '9', target: '10', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e10-6', source: '10', target: '6', markerEnd: { type: MarkerType.ArrowClosed } },
    // 후처리(7) → 종료(8)
    { id: 'e7-8', source: '7', target: '8', markerEnd: { type: MarkerType.ArrowClosed } },
  ],
}; 