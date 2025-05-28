import { useState } from "react";
import { useQuery } from '@tanstack/react-query';

async function fetchDocuments(page: number=1, pageSize: number=10, filters: any = {}, recentDays?: number): Promise<{documents: any[], count: number}> {
  let url = `/api/documents?page=${page}&pageSize=${pageSize}`;
  if (recentDays) url += `&recentDays=${recentDays}`;
  const res = await fetch(url);
  const data = await res.json();
  // count가 없으면 documents.length fallback
  return { documents: data.documents || [], count: data.count ?? (data.documents?.length ?? 0) };
}

export function useDocuments({ recentDays }: { recentDays?: number } = {}) {
  // 내부 상태로 page, pageSize 관리
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({
    tags: [] as string[],
    title: '', // 또는 null
    // ...다른 검색 조건
  });

  // GET 노트 목록 불러오기 (react-query)
  const documentsQuery = useQuery<{documents: any[], count: number}>({
    queryKey: ['documents', page, pageSize, filters, recentDays],
    queryFn: () => fetchDocuments(page, pageSize, filters, recentDays),
  });

  // 최신순 정렬 후 3개만 추출
  const sorted = (documentsQuery.data?.documents ?? []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const top3 = sorted.slice(0, 3);

  return {
    // 쿼리 데이터
    documents: documentsQuery.data?.documents ?? [],
    top3Documents: top3,
    totalCount: documentsQuery.data?.count ?? 0,
    loading: documentsQuery.isLoading,
    errors: documentsQuery.error,
    page,
    setPage,
    pageSize,
    setPageSize,
  };
}
