"use client";
import { StatCard } from "./state-card";
import { Newspaper } from "lucide-react";
import { useNews } from "@/hooks/useNesw";

export function NewsCountCard() {
  const { news, isLoading } = useNews({ recentDays: 7, limit: 1000 });

  if (isLoading) {
    return (
      <StatCard
        title="최근 1주일 뉴스"
        value={0}
        description="로딩중..."
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
      trend="up"
    />
  );
}
