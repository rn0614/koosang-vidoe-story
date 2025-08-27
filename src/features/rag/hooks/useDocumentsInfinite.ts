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

export function useDocumentsInfinite(filters = {}) {
  return useInfiniteQuery(
    ['documents', filters],
    ({ pageParam = 1 }) => fetchDocuments({ pageParam, filters }),
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      select: (data) => {
        // 모든 페이지의 문서를 합치고 태그별 출현 횟수 계산
        const allDocuments = data.pages.flatMap(page => page.documents);
        
        // 모든 태그의 출현 횟수를 합산
        const tagCounts = allDocuments
          .map(doc => doc.metadata?.tags || [])
          .flat()
          .reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        
        // 태그와 출현 횟수를 배열로 변환
        const tagsWithCount = Object.entries(tagCounts).map(([tag, count]) => ({
          tag,
          count: count as number
        })).sort((a, b) => b.count - a.count); // count 기준 내림차순 정렬
        
        return {
          ...data,
          documents: allDocuments,
          tags: tagsWithCount,
        };
      },
    },
  );
}
