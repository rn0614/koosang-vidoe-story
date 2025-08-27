import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server'; // supabase 클라이언트 유틸
import { extractLinks } from '@/shared/lib/utils';

export async function POST() {
  // 1. 크롤링 및 링크 추출
  const newsUrl = 'https://brutalist.report/topic/tech';
  const linkRegex = /<li><a href="(https?:\/\/[^\"]+)"[^>]*>([^<]+)<\/a>\s*\[[^\]]+\]\s*(?!(?:<a href="\/bruticle\/[^>]+>|\[<a href="ㅎ\\https?:\/\/news\\.youcomvinator\\.com[^>]+>\]))/g;
  
  console.log('crawl-tech-news1', newsUrl, linkRegex);
  const result = await extractLinks(newsUrl, linkRegex);
  console.log('crawl-tech-news2', result);

  // 2. Supabase에 저장 (예시, 실제 테이블 구조에 맞게 수정 필요)
  const supabase = await createClient();
  console.log('crawl-tech-news3');
  // AI 관련 키워드 20개
  const AI_KEYWORDS = [
    'AI', '인공지능', 'Artificial Intelligence', 'GPT', 'ChatGPT', 'OpenAI', 'LLM', 'Language Model',
    '딥러닝', 'Deep Learning', '머신러닝', 'Machine Learning', 'Stable Diffusion', 'Midjourney',
    '생성형', 'Generative', 'Vision AI', 'Computer Vision', '자연어처리', 'NLP', 'MCP'
  ];

  function containsAIKeyword(str: string) {
    if (!str) return false;
    return AI_KEYWORDS.some(keyword =>
      str.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 최대 20개만, title(text) 또는 url에 AI 키워드 포함된 것만, description은 빈 문자열
  const newsRows = (result.links || [])
    .filter(link =>
      containsAIKeyword(link.text) ||
      containsAIKeyword(link.url)
    )
    .slice(0, 20)
    .map(link => ({
      title: link.text,
      link: link.url,
      description: '',
    }));
  
  const { data, error } = await supabase.from('news').insert(newsRows);
  console.log('crawl-tech-news4', data, error);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ ok: true, count: newsRows.length, links: newsRows });
  }
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

