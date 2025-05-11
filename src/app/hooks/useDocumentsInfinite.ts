import { useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 10;

async function fetchDocuments({ pageParam = 1 }) {
    const res = await fetch(`/api/documents?page=${pageParam}&pageSize=${PAGE_SIZE}`);
    const data = await res.json();
    return {
      documents: data.documents || [],
      nextPage: data.hasMore ? pageParam + 1 : undefined,
    };
}

export function useInfiniteDocuments() {
  return useInfiniteQuery(
    ['documents'],
    fetchDocuments,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );
}