'use client'
import { useState, useEffect, DragEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Settings, GripVertical } from "lucide-react"
import {
  movementData,
  MovementData,
  MovementCommon1,
  MovementCommon2,
  WorkInfo,
  QualityInfo,
  LogisticsInfo
} from "@/__mocks__/moving-table.mock"

interface DataGroupColumn {
  key: string
  label: string
}

interface DataGroup {
  id: string
  label: string
  color: string
  columns: DataGroupColumn[]
}

interface Column {
  id: string
  label: string
  key: string
  groupId: string
  groupLabel?: string
  groupColor?: string
  isSticky?: boolean
}

const dataGroups: DataGroup[] = [
  {
    id: "workInfo",
    label: "작업 정보",
    color: "bg-blue-100 text-blue-800",
    columns: [
      { key: "operator", label: "작업자" },
      { key: "startTime", label: "시작시간" },
      { key: "endTime", label: "종료시간" },
      { key: "workOrder", label: "작업지시서" }
    ]
  },
  {
    id: "qualityInfo", 
    label: "품질 정보",
    color: "bg-green-100 text-green-800",
    columns: [
      { key: "inspector", label: "검사자" },
      { key: "defectRate", label: "불량률" },
      { key: "batchNo", label: "배치번호" },
      { key: "testResult", label: "검사결과" }
    ]
  },
  {
    id: "logisticsInfo",
    label: "물류 정보", 
    color: "bg-purple-100 text-purple-800",
    columns: [
      { key: "vehicle", label: "운송수단" },
      { key: "driver", label: "운전자" },
      { key: "route", label: "경로" },
      { key: "weight", label: "중량" }
    ]
  }
]

// 모든 컬럼을 하나의 배열로 통합
type AllColumnId = string;
const allColumns: Column[] = [
  { id: "item", label: "물품명", key: "item", groupId: "common1", isSticky: true },
  { id: "from", label: "출발지", key: "from", groupId: "common1", isSticky: true },
  { id: "to", label: "도착지", key: "to", groupId: "common2" },
  { id: "qty", label: "수량", key: "qty", groupId: "common2" },
  { id: "date", label: "날짜", key: "date", groupId: "common2" },
  // 추가 컬럼은 동적으로 추가됨
  // 액션 컬럼은 별도 처리
];

function getDynamicColumns(selectedGroups: string[]): Column[] {
  let dynamic: Column[] = [];
  selectedGroups.forEach(groupId => {
    const group = dataGroups.find(g => g.id === groupId);
    if (group) {
      const groupColumns: Column[] = group.columns.map(col => ({
        id: `${groupId}-${col.key}`,
        label: col.label,
        key: col.key,
        groupId: groupId,
        groupLabel: group.label,
        groupColor: group.color
      }));
      dynamic = [...dynamic, ...groupColumns];
    }
  });
  return dynamic;
}

const LOCAL_STORAGE_KEY = 'movingTableHeaderState';

export default function CheckboxGroupedData() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(["workInfo", "qualityInfo"]);
  const [columnOrder, setColumnOrder] = useState<AllColumnId[]>(() => {
    const dynamic = getDynamicColumns(["workInfo", "qualityInfo"]);
    return [
      ...allColumns.map(c => c.id),
      ...dynamic.map(c => c.id)
    ];
  });
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // localStorage에서 상태 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.columnOrder) && Array.isArray(parsed.selectedGroups)) {
          setSelectedGroups(parsed.selectedGroups);
          setColumnOrder(parsed.columnOrder);
        }
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  // 상태 복원 버튼 핸들러
  function handleRestoreHeaderState() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.columnOrder) && Array.isArray(parsed.selectedGroups)) {
          setSelectedGroups(parsed.selectedGroups);
          setColumnOrder(parsed.columnOrder);
        }
      } catch {}
    }
  }

  // 그룹 토글 시 컬럼 순서도 동기화
  const handleGroupToggle = (groupId: string): void => {
    setSelectedGroups(prev => {
      let next: string[];
      if (prev.includes(groupId)) {
        next = prev.filter(id => id !== groupId);
      } else {
        next = [...prev, groupId];
      }
      // 동적 컬럼 id
      const dynamic = getDynamicColumns(next);
      setColumnOrder(order => {
        // 기존 order에서 빠진 컬럼 제거, 새로 추가된 컬럼 뒤에 붙임
        const staticIds = allColumns.map(c => c.id);
        const dynamicIds = dynamic.map(c => c.id);
        const filtered = order.filter(id => staticIds.includes(id) || dynamicIds.includes(id));
        const missing = dynamicIds.filter(id => !filtered.includes(id));
        return [...filtered, ...missing];
      });
      return next;
    });
  };

  // 현재 표시할 컬럼(순서 적용)
  const getVisibleColumns = (): Column[] => {
    const dynamic = getDynamicColumns(selectedGroups);
    const staticMap = new Map(allColumns.map(c => [c.id, c]));
    const dynamicMap = new Map(dynamic.map(c => [c.id, c]));
    return columnOrder.map(id => staticMap.get(id) || dynamicMap.get(id)).filter(Boolean) as Column[];
  };

  const handleDragStart = (e: DragEvent<HTMLTableHeaderCellElement>, columnId: string): void => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLTableHeaderCellElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent<HTMLTableHeaderCellElement>, targetColumnId: string): void => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumnId) {
      const current = [...columnOrder];
      const from = current.indexOf(draggedColumn);
      const to = current.indexOf(targetColumnId);
      if (from !== -1 && to !== -1) {
        current.splice(from, 1);
        current.splice(to, 0, draggedColumn);
        setColumnOrder(current);
      }
    }
    setDraggedColumn(null);
  };

  const getCellValue = (item: MovementData, column: Column): string | number => {
    if (column.groupId === 'common1') {
      return item.common1[column.key as keyof MovementCommon1];
    }
    if (column.groupId === 'common2') {
      return item.common2[column.key as keyof MovementCommon2];
    }
    if (column.groupId === 'workInfo') {
      return item.workInfo[column.key as keyof WorkInfo] ?? "-";
    }
    if (column.groupId === 'qualityInfo') {
      return item.qualityInfo[column.key as keyof QualityInfo] ?? "-";
    }
    if (column.groupId === 'logisticsInfo') {
      return item.logisticsInfo[column.key as keyof LogisticsInfo] ?? "-";
    }
    return "-";
  };

  const visibleColumns = getVisibleColumns();

  // 저장 버튼 핸들러
  function handleSaveHeaderState() {
    console.log(columnOrder, selectedGroups);
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ columnOrder, selectedGroups })
    );
    alert("저장되었습니다.");
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      {/* 데이터 그룹 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            표시할 데이터 그룹 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {dataGroups.map((group) => (
              <div key={group.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={group.id}
                  checked={selectedGroups.includes(group.id)}
                  onCheckedChange={() => handleGroupToggle(group.id)}
                />
                <label htmlFor={group.id} className="cursor-pointer">
                  <Badge className={group.color}>
                    {group.label}
                  </Badge>
                </label>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            💡 모든 컬럼 헤더를 드래그해서 순서를 변경할 수 있습니다. (액션 제외)
          </div>
        </CardContent>
      </Card>

      {/* 데이터 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>물품 이동 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px] overflow-auto">            
            <table className="w-full min-w-max" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr className="border-b">
                  {visibleColumns.map((column, index) => (
                    <th
                      key={column.id}
                      draggable={column.id !== '액션' && column.groupId !== 'common1'}
                      onDragStart={column.id !== '액션' && column.groupId !== 'common1' ? (e) => handleDragStart(e, column.id) : undefined}
                      onDragOver={column.id !== '액션' && column.groupId !== 'common1' ? handleDragOver : undefined}
                      onDrop={column.id !== '액션' && column.groupId !== 'common1' ? (e) => handleDrop(e, column.id) : undefined}
                      className={`text-left p-3 font-medium min-w-[120px] border-r border-b sticky top-0 z-30 bg-gray-50 ${
                        column.groupColor || ''
                      } ${draggedColumn === column.id ? 'opacity-50' : ''} ${column.isSticky ? 'sticky left-[' + (index * 120) + 'px] z-30' : ''}`}
                      style={column.isSticky ? {
                        left: `${index * 120}px`,
                        width: '120px',
                        boxShadow: index === 1 ? '2px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
                      } : {}}
                    >
                      <div className="flex items-center gap-2">
                        {column.id !== '액션' && column.groupId !== 'common1' && (
                           <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        <div>
                          {column.label}
                          <div className="text-xs font-normal opacity-75">
                            {column.groupId.startsWith('common') ? `공통${column.groupId === 'common1' ? '1' : '2'} 정보` : column.groupLabel}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                  {/* 액션 컬럼 */}
                  <th className="text-left p-3 font-medium bg-gray-50 min-w-[100px] border-r border-b sticky top-0 z-30">
                    액션
                    <div className="text-xs font-normal opacity-75">
                      -
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {movementData.map((item, rowIndex) => (
                  <tr key={item.id} className={`border-b hover:bg-blue-50 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}> 
                    {visibleColumns.map((column, index) => (
                      <td
                        key={`${item.id}-${column.id}`}
                        className={`p-3 font-medium border-r border-b ${column.isSticky ? 'sticky left-[' + (index * 120) + 'px] z-10' : ''}`}
                        style={column.isSticky ? {
                          left: `${index * 120}px`,
                          width: '120px',
                          backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                          boxShadow: index === 1 ? '2px 0 5px -2px rgba(0,0,0,0.1)' : 'none'
                        } : {}}
                      >
                        {getCellValue(item, column)}
                      </td>
                    ))}
                    {/* 액션 셀 */}
                    <td className="p-3 min-w-[100px] border-r border-b">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 컬럼 순서 리셋/복원 버튼 */}
      <Card className="bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm text-gray-600">
              <strong>현재 표시중:</strong> {visibleColumns.map(col => col.label).join(", ")} + 액션
              <div className="text-xs text-gray-500 mt-1">
                전체 컬럼: {visibleColumns.length + 1}개 (액션 포함)
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const dynamic = getDynamicColumns(selectedGroups);
                  setColumnOrder([
                    ...allColumns.map(c => c.id),
                    ...dynamic.map(c => c.id)
                  ]);
                }}
                disabled={columnOrder.length === allColumns.length + getDynamicColumns(selectedGroups).length}
              >
                컬럼 순서 초기화
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRestoreHeaderState}
              >
                저장된 헤더 상태 불러오기
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveHeaderState}
              >
                헤더 상태 저장
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}