"use client";
import { StatCard } from "./state-card";
import { Image } from "lucide-react";
// AI 이미지 관련 데이터 fetch 훅 필요 (예: useAiImages)

export function AiImageCountCard() {
//   // 예: 최근 30일간 이미지 개수
//   const { images, loading } = useAiImages(); // 커스텀 훅 필요
//   const recentCount = images.filter(
//     img => new Date(img.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//   ).length;

  return (
    <StatCard
      title="AI 이미지"
      value={0}
      description="최근 한 달 생성"
      icon={<Image className="h-4 w-4 text-muted-foreground" />}
      trend="up"
    />
  );
}
