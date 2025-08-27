import { useQuery } from '@tanstack/react-query';

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
