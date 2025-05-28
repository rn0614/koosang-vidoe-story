"use client";
import { useEffect, useState } from "react";

// 임시 데이터 (실제로는 API에서 가져와야 함)
const mockDailyData = [
  { day: "월", images: 12 },
  { day: "화", images: 18 },
  { day: "수", images: 25 },
  { day: "목", images: 22 },
  { day: "금", images: 30 },
  { day: "토", images: 35 },
  { day: "일", images: 28 },
];

export function AiImageTrendChart() {
  const [data, setData] = useState(mockDailyData);
  const maxImages = Math.max(...data.map(d => d.images));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-32 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1">
            <div 
              className="bg-green-500 w-full rounded-t"
              style={{ 
                height: `${(item.images / maxImages) * 100}%`,
                minHeight: '8px'
              }}
            />
            <div className="text-xs text-muted-foreground">{item.day}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
        <div>
          <p className="text-xs text-muted-foreground">이번 주 총합</p>
          <p className="text-lg font-semibold">
            {data.reduce((sum, item) => sum + item.images, 0)}개
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">일평균</p>
          <p className="text-lg font-semibold">
            {Math.round(data.reduce((sum, item) => sum + item.images, 0) / data.length)}개
          </p>
        </div>
      </div>
    </div>
  );
}
