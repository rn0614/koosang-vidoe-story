import { useState } from "react";
import { useQuery } from '@tanstack/react-query';

function buildQueryString(params: Record<string, any>) {
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${encodeURIComponent(k)}=${encodeURIComponent(v.join(','))}`;
      return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
    })
    .join('&');
  return query ? `?${query}` : '';
}

// API 응답 타입 정의
interface DocumentsApiResponse {
  documents: any[];
  hasMore?: boolean;
  count?: number;
  totalCount?: number;
  recentCount?: number;
}

async function fetchDocuments(filters: any = {}, recentDays?: number): Promise<DocumentsApiResponse> {
  const params: Record<string, any> = {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 10,
  };
  if (recentDays) params.recentDays = recentDays;
  if (filters.tags && filters.tags.length > 0) params.tags = filters.tags;
  if (filters.title) params.title = filters.title;
  // ...필요시 다른 필터 추가
  const url = `/api/documents${buildQueryString(params)}`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    documents: data.documents || [],
    hasMore: data.hasMore,
    count: data.count,
    totalCount: data.totalCount,
    recentCount: data.recentCount,
  };
}

export function useDocuments({ recentDays, page, pageSize }: { recentDays?: number, page?: number, pageSize?: number } = {}) {
  // page, pageSize를 filters에 포함
  const [filters, setFilters] = useState({
    page: page,
    pageSize: pageSize,
    tags: [] as string[],
    title: '', // 또는 null
    // ...다른 검색 조건
  });

  // GET 노트 목록 불러오기 (react-query)
  const documentsQuery = useQuery<DocumentsApiResponse>({
    queryKey: ['documents', filters, recentDays],
    queryFn: () => fetchDocuments(filters, recentDays),
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
    totalCount: documentsQuery.data?.totalCount ?? 0,
    count: documentsQuery.data?.count ?? 0,
    recentCount: documentsQuery.data?.recentCount ?? 0,
    hasMore: documentsQuery.data?.hasMore ?? false,
    loading: documentsQuery.isLoading,
    errors: documentsQuery.error,
    filters,
    setFilters,
  };
}
