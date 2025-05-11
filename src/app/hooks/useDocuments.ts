import { useQuery } from '@tanstack/react-query';

async function fetchDocuments(): Promise<any[]> {
  const res = await fetch('/api/documents');
  const data = await res.json();
  return data.documents || [];
}

export function useDocuments() {
  // GET 노트 목록 불러오기 (react-query)
  const documentsQuery = useQuery<any[]>({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  return {
    // 쿼리 데이터
    documents: documentsQuery.data ?? [],
    loading: documentsQuery.isLoading,
    errors: documentsQuery.error,
  };
}
