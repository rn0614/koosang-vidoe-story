import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

type Filters = {
  tags?: string[];
  title?: string;
};

async function fetchDocuments({
  pageParam = 1,
  filters = {},
}: {
  pageParam: number;
  filters: Filters;
}) {
  const params = new URLSearchParams({
    page: String(pageParam),
    pageSize: String(PAGE_SIZE),
  });
  if (filters.tags && filters.tags.length > 0) {
    params.append('tags', filters.tags.join(','));
  }
  if (filters.title) {
    params.append('title', filters.title);
  }
  // ...다른 조건도 추가
  const res = await fetch(`/api/documents?${params.toString()}`);
  const data = await res.json();
  return {
    documents: data.documents || [],
    tags: data.tags || [],
    nextPage: data.hasMore ? pageParam + 1 : undefined,
  };
}

export function useInfiniteDocuments(filters = {}) {
  return useInfiniteQuery(
    ['documents', filters],
    ({ pageParam = 1 }) => fetchDocuments({ pageParam, filters }),
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    },
  );
}
