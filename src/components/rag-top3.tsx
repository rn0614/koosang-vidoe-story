"use client";
import { useDocuments } from "@/hooks/useDocuments";
import { Link } from "@/i18n/navigation";

export function RagTop3Table() {
  const { top3Documents, loading } = useDocuments();

  if (loading) return <div className="md:block hidden">로딩중...</div>;

  return (
    <div className="space-y-4 md:block">
      {top3Documents.map((ragPost) => (
        <Link key={ragPost.id} href={`/rag/${ragPost.metadata.title}--${ragPost.id}`} className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-sm font-medium leading-none">{ragPost.metadata?.title}</p>
              <p className="text-sm text-muted-foreground">{ragPost.metadata?.excerpt}</p>
            </div>
          </div>
          <div className="flex hidden items-center space-x-4 md:block">
            <p className="text-sm font-medium">{ragPost.metadata?.updated_at}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
