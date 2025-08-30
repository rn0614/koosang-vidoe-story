"use client";
import { useDocuments } from "@/features/rag/hooks/useDocuments";
import { Link } from "@/shared/lib/i18n/navigation";

export function RagTop3Table() {
  const { top3Documents, loading } = useDocuments();

  if (loading) return <div className="md:block hidden">로딩중...</div>;

  return (
    <div className="space-y-4 md:block">
      {top3Documents.map((ragPost) => (
        <Link
          key={ragPost.id}
          href={`/rag/${ragPost.metadata.title}--${ragPost.id}`}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center justify-between min-w-0">
            <p className="text-base font-semibold leading-none line-clamp-1">{ragPost.metadata?.title}</p>
            <p className="text-xs text-muted-foreground font-light ml-2 truncate max-w-[120px] flex-shrink-0 hidden md:block">
              {ragPost.metadata?.updated_at}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-none line-clamp-2">
            {ragPost.metadata?.excerpt}
          </p>
        </Link>
      ))}
    </div>
  );
}
