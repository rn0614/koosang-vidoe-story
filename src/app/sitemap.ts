import { MetadataRoute } from "next";
import { createClient } from "@/shared/lib/supabase/server";
import { DocumentMetadata } from "@/shared/types/document-metadata";

type SitemapItem = {
  url: string;
  lastModified: Date;
  changeFrequency: "weekly" | "always" | "hourly" | "daily" | "monthly" | "yearly" | "never";
  priority: number;
};


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!+"/ko";
  const supabase = await createClient();

  // 1. 모든 문서 id, updated_at, slug(있다면) 가져오기
  const { data: docs, error } = await supabase
    .from("documents")
    .select("id, metadata")
    .order("id", { ascending: false });

  if (error) {
    throw new Error("문서 목록을 불러오지 못했습니다: " + error.message);
  }

  // 2. sitemap 배열 생성
  const ragPages = (docs ?? []).map((doc) => {
    // metadata를 DocumentMetadata 타입으로 캐스팅
    const metadata = doc.metadata as DocumentMetadata | null;
    
    // titleAndId는 보통 slug--id 형태이거나, 그냥 id일 수 있음
    // metadata.title 또는 metadata.slug가 있다면 활용
    const title = metadata?.title ?? "";
    // slug가 있다면 slug--id, 없다면 id만
    const titleAndId = metadata?.title
      ? `${metadata.title}--${doc.id}`
      : doc.id;

    return {
      url: `${baseUrl}/rag/${encodeURIComponent(titleAndId)}`,
      lastModified: metadata?.updatedAt
        ? new Date(metadata.updatedAt)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    } as SitemapItem;
  });

  // 3. 홈 등 기본 경로 추가
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...ragPages,
  ];
}
