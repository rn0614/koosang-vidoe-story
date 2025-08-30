'use client';
import { useDocumentsInfinite } from '@/features/rag/hooks/useDocumentsInfinite';
import { Link } from '@/shared/lib/i18n/navigation';
import { useRef, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import Image from 'next/image';
import { Button } from '@/shared/ui/button';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSupabaseImageUrl } from '@/shared/lib/utils';
import { TagWithCount, Document } from '@/shared/types/document';
import { Loader2 } from 'lucide-react';

function parseTagsParam(tagsParam: string | null): string[] {
  if (!tagsParam) return [];
  return tagsParam
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// 썸네일 경로에서 파일명만 추출해 Supabase URL로 변환
function getThumbnailUrl(thumbnail?: string) {
  if (!thumbnail) return undefined;
  const filename = thumbnail.split('/').pop()!;
  return getSupabaseImageUrl('rag-image', filename);
}

export default function DocumentList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tagsParam = searchParams.get('tags');
  const selectedTags = useMemo(() => parseTagsParam(tagsParam), [tagsParam]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useDocumentsInfinite({ tags: selectedTags });

  // API에서 받은 documents와 tags
  const documents = data ? data.pages.flatMap((page) => page.documents) : [];

  // 태그별 출현 횟수 계산
  const tagsWithCount = useMemo((): TagWithCount[] => {
    if (!data || data.pages.length === 0) return [];

    const tagCounts = data.pages
      .flatMap((page) => page.documents)
      .map((doc) => doc.metadata?.tags || [])
      .flat()
      .reduce(
        (acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count: count as number,
      }))
      .sort((a, b) => b.count - a.count); // count 기준 내림차순 정렬
  }, [data]);

  // WebView 감지
  const isWebView =
    typeof window !== 'undefined' && (window as any).ReactNativeWebView;

  // WebView 메시지 전송 함수
  const sendWebViewMessage = useCallback(
    (document: Document) => {
      if (isWebView) {
        const message = {
          type: 'ROUTER_EVENT',
          data: `/rag/${document.metadata.title}--${document.id}`,
          title: document.metadata.title,
          params: {
            documentId: document.id,
            documentTitle: document.metadata.title,
            category: 'rag',
            source: 'document_list',
            tags: document.metadata.tags || [],
            excerpt: document.metadata.excerpt || '',
            thumbnail: document.metadata.thumbnail,
            createdAt: document.metadata.createdAt,
            updatedAt: document.metadata.updatedAt,
          },
          navigationMode: 'push',
        };
        window.ReactNativeWebView?.postMessage(JSON.stringify(message));
      }
    },
    [isWebView],
  );

  // 링크 클릭 핸들러
  const handleLinkClick = useCallback(
    (e: React.MouseEvent, document: any) => {
      if (isWebView) {
        e.preventDefault();
        sendWebViewMessage(document);
      }
    },
    [isWebView, sendWebViewMessage],
  );

  // IntersectionObserver로 무한스크롤 구현
  const observer = useRef<IntersectionObserver | null>(null);
  const lastDocRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // 태그 버튼 클릭 시 쿼리스트링 갱신
  const handleTagClick = (tag: string) => {
    let nextTags: string[];
    if (selectedTags.includes(tag)) {
      nextTags = selectedTags.filter((t) => t !== tag);
    } else {
      nextTags = [...selectedTags, tag];
    }
    const params = new URLSearchParams(searchParams.toString());
    if (nextTags.length > 0) {
      params.set('tags', nextTags.join(','));
    } else {
      params.delete('tags');
    }
    router.replace(`?${params.toString()}`);
  };

  // 전체 버튼 클릭
  const handleAllClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tags');
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="mx-auto w-full p-4">
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        RAG 적용 노트
      </h3>
      {/* 태그 필터 UI */}
      <div className="sticky top-16 z-20 mb-2 py-2">
        <div className="scrollbar-hide flex flex-nowrap gap-2 overflow-x-auto rounded-lg bg-gray-100/80 px-2 py-2 shadow-sm transition dark:bg-gray-800/80">
          <Button
            variant={selectedTags.length === 0 ? 'default' : 'outline'}
            onClick={handleAllClick}
          >
            전체
          </Button>
          {tagsWithCount.map((tagWithCount) => (
            <Button
              key={tagWithCount.tag}
              variant={
                selectedTags.includes(tagWithCount.tag) ? 'default' : 'outline'
              }
              onClick={() => handleTagClick(tagWithCount.tag)}
              className="relative"
            >
              {tagWithCount.tag} ({tagWithCount.count})
            </Button>
          ))}
        </div>
      </div>
      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      {!isLoading && documents.length === 0 ? (
        <div className="text-gray-400 dark:text-gray-500">노트가 없습니다.</div>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {documents.map((document, idx) => (
              <Card
                key={document.id}
                className="md:max-w-full"
                ref={idx === documents.length - 1 ? lastDocRef : undefined}
              >
                <Link
                  href={`/rag/${document.metadata.title}--${document.id}`}
                  onClick={(e) => handleLinkClick(e, document)}
                >
                  <CardHeader>
                    <CardTitle className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {document.metadata.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex aspect-[5/4] w-full items-center justify-center overflow-hidden bg-gray-800">
                      <Image
                        src={
                          getThumbnailUrl(document.metadata.thumbnail) ||
                          '/image/no-image-found.png'
                        }
                        alt={document.metadata.title}
                        width={300}
                        height={240}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <CardDescription>
                      {document.metadata.excerpt ||
                        document.metadata.description ||
                        ''}
                    </CardDescription>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
          {isFetchingNextPage && (
            <div className="py-2 text-center">로딩중...</div>
          )}
        </div>
      )}
    </div>
  );
}
