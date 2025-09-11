import { useQuery } from '@tanstack/react-query';

export function useNews({ limit = 4, recentDays=7 }: { limit?: number; recentDays?: number } = {}) {
  const queryKey = ['news', limit, recentDays];
  const queryFn = async () => {
    let url = `/api/crawl-tech-news?limit=${limit}`;
    if (recentDays) url += `&recentDays=${recentDays}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data || [];
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
  });

  return {
    news: data ?? [],
    isLoading,
    error,
    refetch,
  };
}
