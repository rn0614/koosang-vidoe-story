"use client";
import { StatCard } from "../widget/state-card";
import { Image } from "lucide-react";
import { useAIImage } from "@/hooks/useAIImage";
// AI 이미지 관련 데이터 fetch 훅 필요 (예: useAiImages)

export function AiImageCountCard() {
  const { count, isLoading } = useAIImage({ recentDays: 30 });

  return (
    <StatCard
      title="AI 이미지"
      value={isLoading ? 0 : count}
      description="최근 한 달 생성"
      icon={<Image className="h-4 w-4 text-muted-foreground" />}
      trend="up"
    />
  );
}
