import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { Database } from '@/shared/types/database.types';
import { DocumentMetadata } from '@/shared/types/document-metadata';

// 태그 카운트 타입 정의
interface TagWithCount {
  tag: string;
  count: number;
}

// API 응답 타입 정의
interface DocumentsListResponse {
  documents: Database['public']['Tables']['documents']['Row'][];
  hasMore: boolean;
  count: number | null;
  totalCount: number | null;
  recentCount: number | null;
  tags: TagWithCount[];
}

interface ErrorResponse {
  error: string;
}

// 동적 렌더링 강제 설정
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest
): Promise<NextResponse<DocumentsListResponse | ErrorResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // tags 파라미터 파싱
    const tagsParam = searchParams.get('tags');
    const tagsFilter = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(Boolean) : null;

    const supabase = await createClient();

    // 전체 documents 개수 (필터와 무관)
    const { count: totalCount } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true });

    // 최근 30일 updated_at 개수 (필터와 무관)
    const recent30 = new Date();
    recent30.setDate(recent30.getDate() - 30);
    const { count: recentCount } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .gte('metadata->>updated_at', recent30.toISOString());

    // 태그 필터가 있으면 count도 필터링된 쿼리로
    let filteredCount = totalCount;
    if (tagsFilter && tagsFilter.length > 0) {
      const { count } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .contains('metadata->tags', JSON.stringify(tagsFilter));
      filteredCount = count ?? 0;
    }

    // 실제 데이터 쿼리
    let query = supabase
      .from('documents')
      .select(`
        id, 
        content, 
        metadata, 
        thumbnail,
        path,
        updated_at,
        embedding
      `, { count: 'exact' });

    if (tagsFilter && tagsFilter.length > 0) {
      query = query.contains('metadata->tags', JSON.stringify(tagsFilter));
    }

    query = query
      .order('updated_at', { ascending: false })
      .range(from, to);

    const { data, error } = await query;
    const documents = data ?? [];

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: `Failed to fetch documents: ${error.message}` }, 
        { status: 500 }
      );
    }

    // 전체 문서에서 태그별 출현 횟수 계산
    const tagCounts = documents
      .map(doc => {
        const metadata = doc.metadata as DocumentMetadata | null;
        return metadata?.tags || [];
      })
      .flat()
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // 태그와 출현 횟수를 배열로 변환
    const tagsWithCount: TagWithCount[] = Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count: count as number
      }))
      .sort((a, b) => b.count - a.count); // count 기준 내림차순 정렬

    // hasMore: 다음 페이지가 있는지 여부 (필터링된 count 기준)
    const hasMore = documents.length === pageSize && (filteredCount ? to + 1 < filteredCount : true);

    return NextResponse.json({ 
      documents, 
      hasMore, 
      count: filteredCount, 
      totalCount, 
      recentCount, 
      tags: tagsWithCount 
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
