"use client";
import { StatCard } from "./state-card";
import { TrendingUp } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";

export function RagPostCountCard() {
  // 최근 30일간 문서 개수
  const { totalCount, loading } = useDocuments({ recentDays: 30 });

  return (
    <StatCard
      title="RAG 포스팅"
      value={totalCount}
      description="최근 30일간 새 글"
      icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      trend="up"
    />
  );
}
