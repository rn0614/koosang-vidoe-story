import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // supabase 클라이언트 유틸
import { extractLinks } from '@/utils/utils';

export async function POST() {
  // 1. 크롤링 및 링크 추출
  const newsUrl = 'https://brutalist.report/topic/tech';
  const linkRegex = /<li><a href="(https?:\/\/[^\"]+)"[^>]*>([^<]+)<\/a>\s*\[[^\]]+\]\s*(?!(?:<a href="\/bruticle\/[^>]+>|\[<a href="ㅎ\\https?:\/\/news\\.youcomvinator\\.com[^>]+>\]))/g;
  const result = await extractLinks(newsUrl, linkRegex);


  // 2. Supabase에 저장 (예시, 실제 테이블 구조에 맞게 수정 필요)
  const supabase = await createClient();
  await supabase.from('news').insert(result.links);
  
  return NextResponse.json({ ok: true, count: result.links.length, links: result.links });
}


export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '4', 10);
  const recentDays = searchParams.get('recentDays');

  let query = supabase.from('news').select('*');

  if (recentDays) {
    // 최근 N일 내의 뉴스만 필터
    const days = parseInt(recentDays, 10);
    const since = new Date();
    since.setDate(since.getDate() - days);
    query = query.gte('created_at', since.toISOString());
  }

  query = query.order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  return NextResponse.json({ ok: true, data, error });
}

