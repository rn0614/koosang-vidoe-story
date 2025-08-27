import { useQuery } from '@tanstack/react-query';

interface AIImage {
  created_at: string;
  description: string;
  image_url: string;
  title: string;
}

interface AIImageApiResponse {
  imagesData: AIImage[];
  count?: number;
}

async function fetchAIImage(limit?: number, recentDays?: number): Promise<AIImageApiResponse> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (recentDays) params.append('recentDays', recentDays.toString());
  
  const url = `/api/ai-image${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch AI images: ${res.statusText}`);
  }
  
  const data = await res.json();
  return {
    imagesData: data.imagesData ?? [],
    count: data.count ?? 0,
  };
}

export function useAIImage({
  limit = 8,
  recentDays,
}: { limit?: number; recentDays?: number } = {}) {
  const aiImageQuery = useQuery<AIImageApiResponse>({
    queryKey: ['ai-image', limit, recentDays],
    queryFn: () => fetchAIImage(limit, recentDays),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    cacheTime: 10 * 60 * 1000, // 10분간 메모리에 보관
  });

  return {
    images: aiImageQuery.data?.imagesData ?? [],
    count: aiImageQuery.data?.count ?? 0,
    isLoading: aiImageQuery.isLoading,
    error: aiImageQuery.error,
    refetch: aiImageQuery.refetch,
  };
}

// 타입 export
export type { AIImage };
