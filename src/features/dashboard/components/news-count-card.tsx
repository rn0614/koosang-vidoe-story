"use client";

import { StatCard } from "@/widgets/common/state-card";
import { Newspaper } from "lucide-react";
import { useNews } from "@/features/news/useNews";
import { ErrorBoundary } from "react-error-boundary";

function NewsCountCardInner() {
  const { news, isLoading } = useNews({ recentDays: 7, limit: 1000 });

  if (isLoading) {
    return (
      <StatCard
        title="최근 1주일 뉴스"
        value="..."
        description="로딩 중입니다"
        icon={<Newspaper className="h-4 w-4 text-muted-foreground" />}
        trend="up"
      />
    );
  }

  return (
    <StatCard
      title="최근 1주일 뉴스"
      value={news.length}
      description={`최근 7일간 ${news.length}개의 뉴스`}
      icon={<Newspaper className="h-4 w-4 text-muted-foreground" />}
      trend={news.length > 0 ? "up" : "down"}
    />
  );
}

function NewsFallback({ error, resetErrorBoundary }: any) {
  return (
    <StatCard
      title="최근 1주일 뉴스"
      value="에러"
      description={error?.message ?? "뉴스 데이터를 불러올 수 없습니다."}
      icon={<Newspaper className="h-4 w-4 text-destructive" />}
    />
  );
}

export function NewsCountCard() {
  return (
    <ErrorBoundary
      FallbackComponent={NewsFallback}
      onReset={() => {
        // 필요하다면 상태 리셋 로직 추가
      }}
    >
      <NewsCountCardInner />
    </ErrorBoundary>
  );
}
