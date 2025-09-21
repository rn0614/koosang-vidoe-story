// Document metadata의 구체적인 타입 정의
export interface DocumentMetadata {
  title: string;
  description?: string;
  excerpt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  slug?: string;
  author?: string;
  category?: string;
  thumbnail?: string;
  // 추가 필드들이 있다면 여기에 정의
  [key: string]: unknown;
}

// Supabase Json 타입을 DocumentMetadata로 변환하는 헬퍼 타입
export type JsonToDocumentMetadata<T> = T extends Record<string, any> 
  ? {
      title: string;
      description?: string;
      excerpt?: string;
      tags?: string[];
      createdAt: string;
      updatedAt: string;
      slug?: string;
      author?: string;
      category?: string;
      thumbnail?: string;
    } & Omit<T, 'title' | 'description' | 'excerpt' | 'tags' | 'createdAt' | 'updatedAt' | 'slug' | 'author' | 'category' | 'thumbnail'>
  : DocumentMetadata;

