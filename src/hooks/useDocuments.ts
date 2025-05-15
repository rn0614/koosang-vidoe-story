import { useState } from "react";
import { useQuery } from '@tanstack/react-query';

async function fetchDocuments(page: number=1, pageSize: number=10): Promise<any[]> {
  const res = await fetch(`/api/documents?page=${page}&pageSize=${pageSize}`);
  const data = await res.json();
  return data.documents || [];
}

export function useDocuments() {
  // 내부 상태로 page, pageSize 관리
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // GET 노트 목록 불러오기 (react-query)
  const documentsQuery = useQuery<any[]>({
    queryKey: ['documents', page, pageSize],
    queryFn: () => fetchDocuments(page, pageSize),
  });

  // 최신순 정렬 후 3개만 추출
  const sorted = (documentsQuery.data ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const top3 = sorted.slice(0, 3);

  return {
    // 쿼리 데이터
    documents: documentsQuery.data ?? [],
    top3Documents: top3,
    loading: documentsQuery.isLoading,
    errors: documentsQuery.error,
    page,
    setPage,
    pageSize,
    setPageSize,
  };
}
