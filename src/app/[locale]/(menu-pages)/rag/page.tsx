'use client';
import { useInfiniteDocuments } from '@/hooks/useDocumentsInfinite';
import { Link } from '@/i18n/navigation';
import { useRef, useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTagFilter } from '@/hooks/useTagFilter';

export default function DocumentPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteDocuments();

  const documents = data ? data.pages.flatMap((page) => page.documents) : [];

  // 커스텀 훅으로 태그 필터링 로직 분리
  const {
    selectedTags,
    setSelectedTags,
    toggleTag,
    displayTags,
    filteredDocuments,
  } = useTagFilter(documents);

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
            onClick={() => setSelectedTags([])}
          >
            전체
          </Button>
          {displayTags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              onClick={() => toggleTag(tag)}
              className="relative"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
      {filteredDocuments.length === 0 ? (
        <div className="text-gray-400 dark:text-gray-500">노트가 없습니다.</div>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filteredDocuments.map((document, idx) => (
              <Card
                key={document.id}
                className="md:max-w-full"
                ref={
                  idx === filteredDocuments.length - 1 ? lastDocRef : undefined
                }
              >
                <Link href={`/rag/${document.metadata.title}--${document.id}`}>
                  <CardHeader>
                    <CardTitle className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                      {document.metadata.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex aspect-[5/4] w-full items-center justify-center overflow-hidden bg-gray-800">
                      <Image
                        src={
                          document.metadata.thumbnail
                            ? document.metadata.thumbnail
                            : '/image/no-image-found.png'
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
