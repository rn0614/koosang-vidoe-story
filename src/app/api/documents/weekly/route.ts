import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = parseInt(searchParams.get('range') || '4', 10); // 기본 4주

  // 오늘 날짜 기준 최근 N주 시작일 계산
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (range * 7));
  const startIso = start.toISOString();

  const supabase = await createClient();
  // Supabase에서 SQL 실행 (PostgREST의 rpc 또는 SQL 사용)
  // group_documents_by_week_nweeks(n_weeks int)
  const { data, error } = await supabase.rpc('group_documents_by_week_nweeks', {
    n_weeks: range
  });

  console.log('data',data);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
