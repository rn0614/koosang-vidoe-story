import { useQuery } from '@tanstack/react-query';

interface AIImageApiResponse {
  imagesData: any[];
  count?: number;
}

async function fetchAIImage(limit?: number, recentDays?: number): Promise<AIImageApiResponse> {
  const res = await fetch(`/api/ai-image?limit=${limit}&recentDays=${recentDays}`);
  const data = await res.json();
  return data.data || [];
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

async function fetchDocumentsWeekly(range: number = 4) {
  const res = await fetch(`/api/documents/weekly?range=${range}`);
  const data = await res.json();
  return data.data || [];
}

export function useDocumentsWeekly(range: number = 4) {
  const queryKey = ['documents-weekly', range];
  const queryFn = () => fetchDocumentsWeekly(range);

  const {
    data: weekly = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn,
  });

  return {
    weekly,
    isLoading,
    error,
    refetch,
  };
}