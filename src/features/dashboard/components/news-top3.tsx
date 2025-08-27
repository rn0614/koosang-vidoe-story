"use client";
import { useNews } from "@/shared/hooks/useNews";
import { Link } from "@/shared/lib/i18n/navigation";

export function NewsTop3Table() {
    const { news, isLoading } = useNews({ limit: 3 });

  if (isLoading) return <div className="md:block hidden">로딩중...</div>;

  return (
    <div className="space-y-4 md:block">
      {news.map((curnews: any) => (
        <Link
          key={curnews.id}
          href={curnews.link}
          className="flex flex-col space-y-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center justify-between min-w-0">
            <p className="text-base font-semibold leading-none line-clamp-1">{curnews.title}</p>
            <p className="text-xs text-muted-foreground font-light ml-2 truncate max-w-[120px] flex-shrink-0 hidden md:block">
              {curnews.created_at ? new Date(curnews.created_at).toLocaleDateString() : ''}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-none line-clamp-2">
            {curnews.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
