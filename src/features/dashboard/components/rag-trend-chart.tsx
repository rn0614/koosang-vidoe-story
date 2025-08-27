"use client";
import { useDocumentsWeekly } from "@/shared/hooks/useDocumentsWeekly";

export function RagTrendChart() {
  const { weekly, isLoading, error } = useDocumentsWeekly(4);

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생: {String(error)}</div>;
  if (!weekly.length) return <div>데이터 없음</div>;

  const maxPosts = Math.max(...weekly.map((d: any) => d.count));

  return (
    <div className="space-y-4">
      {weekly.map((item: any, index: number) => (
        <div key={index} className="flex items-center space-x-4">
          <div className="w-24 text-sm text-muted-foreground">{item.week}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div
                className="bg-blue-500 h-6 rounded"
                style={{
                  width: `${(item.count / maxPosts) * 100}%`,
                  minWidth: '20px',
                }}
              />
              <span className="text-sm font-medium">{item.count}개</span>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          총 {weekly.reduce((sum: number, item: any) => sum + item.count, 0)}개의 RAG 포스팅
        </p>
      </div>
    </div>
  );
}
