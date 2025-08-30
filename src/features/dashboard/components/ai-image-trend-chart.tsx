"use client";
import { useAIImage } from "@/features/dashboard/hooks/useAIImage";

interface DayData {
  day: string;
  images: number;
}

export function AiImageTrendChart() {
  const { images, isLoading } = useAIImage({ recentDays: 7 });

  // 최근 7일간의 일별 데이터 생성
  const generateDailyData = (): DayData[] => {
    console.log('images', images);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const today = new Date();
    const dailyData: DayData[] = images.map((img) => ({
      day: img.created_at,
      images: 1,
    }));

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      // 해당 날짜의 이미지 개수 계산
      const dayImages = images.filter(img => {
        const imgDate = new Date(img.created_at);
        return imgDate.toDateString() === date.toDateString();
      }).length;

      dailyData.push({ day: dayName, images: dayImages });
    }

    return dailyData;
  };

  const data = generateDailyData();
  const maxImages = Math.max(...data.map(d => d.images), 1); // 최소값 1로 설정

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

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
