import dayjs from "dayjs";
import { MetadataRoute } from "next";
import path from "path";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://koosang-vidoe-story.vercel.app';


  const createUrl = (slug: string) => {
    // 경로에서 .md 확장자 제거
    const cleanSlug = slug.replace(/\.md$/, '');
    
    // POST_BASE_PATH 이후의 경로만 추출
    const relativePath = cleanSlug.slice("posts".length + 1);
    
    // 경로를 슬래시로 분리
    const pathParts = relativePath.split(path.sep);
    
    // 각 경로 부분을 인코딩 (이중 인코딩 방지)
    const encodedParts = pathParts.map((part: string) => {
      // 이미 인코딩된 부분이 있는지 확인
      try {
        // 디코딩 시도
        const decoded = decodeURIComponent(part);
        // 디코딩 성공 시 원본 값 사용
        return part;
      } catch (e) {
        // 디코딩 실패 시 인코딩
        return encodeURIComponent(part);
      }
    });
    
    // 인코딩된 부분들을 슬래시로 연결
    return encodedParts.join("/");
  };

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
  ];
}
