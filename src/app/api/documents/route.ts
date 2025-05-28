import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '10', 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // tags 파라미터 파싱
  const tagsParam = searchParams.get('tags');
  const tags = tagsParam ? tagsParam.split(',') : null;

  const supabase = await createClient();

  // 1. 전체 documents 개수
  const { count: totalCount } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true });

  // 2. 최근 30일 updated_at 개수
  const recent30 = new Date();
  recent30.setDate(recent30.getDate() - 30);
  const { count: recentCount } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .gte('metadata->>updated_at', recent30.toISOString());

  let query = supabase
    .from('documents')
    .select('id, content, metadata', { count: 'exact' })
    .range(from, to);

  // tags가 있으면 필터 추가
  if (tags && tags.length > 0) {
    query = query.contains('metadata->tags', tags);
  }

  const { data: documents, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // hasMore: 다음 페이지가 있는지 여부
  const hasMore = documents.length === pageSize && (count ? to + 1 < count : true);
  return NextResponse.json({ documents, hasMore, count, totalCount, recentCount });
}
