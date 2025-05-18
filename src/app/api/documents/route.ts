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

  let query = supabase
    .from('documents')
    .select('id, content, metadata', { count: 'exact' })
    .range(from, to);

  // tags가 있으면 필터 추가
  if (tags && tags.length > 0) {
    // metadata->tags를 select에 추가해서 별칭으로 사용
    query = query.contains('metadata->tags', tags);
  }

  const { data: documents, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // hasMore: 다음 페이지가 있는지 여부
  const hasMore = documents.length === pageSize && (count ? to + 1 < count : true);
  return NextResponse.json({ documents, hasMore });
}