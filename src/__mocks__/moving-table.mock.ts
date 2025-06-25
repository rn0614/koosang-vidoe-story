// 타입 정의
export interface MovementCommon1 {
  item: string
  from: string
}

export interface MovementCommon2 {
  to: string
  qty: number
  date: string
}

export interface WorkInfo {
  operator: string
  startTime: string
  endTime: string
  workOrder: string
}

export interface QualityInfo {
  inspector: string
  defectRate: string
  batchNo: string
  testResult: string
}

export interface LogisticsInfo {
  vehicle: string
  driver: string
  route: string
  weight: string
}

export interface MovementData {
  id: string
  common1: MovementCommon1
  common2: MovementCommon2
  workInfo: WorkInfo
  qualityInfo: QualityInfo
  logisticsInfo: LogisticsInfo
}

// 샘플 데이터
export const movementData: MovementData[] = Array.from({ length: 50 }, (_, i) => {
  const idx = i + 1;
  const itemTypes = [
    { item: `부품 A-${100 + idx} (긴 이름의 부품)`, from: `창고A`, to: `라인1` },
    { item: `부품 B-${200 + idx} (매우 긴 이름의 부품 설명)`, from: `창고B`, to: `라인2` },
    { item: `부품 C-${900 + idx}`, from: `창고C`, to: `라인3` }
  ];
  const workOps = ["김작업", "정작업", "서작업", "이작업", "최작업"];
  const inspectors = ["박검사", "최검사", "한검사", "이검사", "정검사"];
  const drivers = ["이운송", "김운송", "박운송", "최운송", "정운송"];
  const vehicles = ["지게차-01", "지게차-02", "지게차-03", "지게차-04", "지게차-05"];
  const batchPrefix = ["A", "B", "C", "D", "E"];
  const date = `2024-06-${(18 + (i % 10)).toString().padStart(2, '0')}`;
  const itemType = itemTypes[i % itemTypes.length];
  return {
    id: `M${(idx).toString().padStart(3, '0')}`,
    common1: {
      item: itemType.item,
      from: itemType.from
    },
    common2: {
      to: itemType.to,
      qty: 10 + (i * 3) % 100,
      date
    },
    workInfo: {
      operator: workOps[i % workOps.length],
      startTime: `${9 + (i % 8)}:${(30 + (i * 7) % 30).toString().padStart(2, '0')}`,
      endTime: `${10 + (i % 8)}:${(15 + (i * 5) % 45).toString().padStart(2, '0')}`,
      workOrder: `WO-2406${date.slice(-2)}-${(idx).toString().padStart(3, '0')}`
    },
    qualityInfo: {
      inspector: inspectors[i % inspectors.length],
      defectRate: `${(i % 5) * 0.1}%`,
      batchNo: `${batchPrefix[i % batchPrefix.length]}2406${date.slice(-2)}${(idx).toString().padStart(3, '0')}`,
      testResult: "합격"
    },
    logisticsInfo: {
      vehicle: vehicles[i % vehicles.length],
      driver: drivers[i % drivers.length],
      route: `${itemType.from}-복도${(i % 5) + 1}-${itemType.to}`,
      weight: `${(15 + (i * 0.7) % 20).toFixed(1)}kg`
    }
  };
});
