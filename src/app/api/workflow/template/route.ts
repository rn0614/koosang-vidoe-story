import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// POST: 템플릿 전체를 jsonb로 저장 (id가 있으면 upsert, 없으면 insert)
export async function POST(req: NextRequest) {
  const { id, name, nodes, connections, current_nodes } = await req.json();

  console.log('POST here', id, name, nodes, connections, current_nodes);
  const templateName = name || `템플릿_${Date.now()}`;
  const template = { nodes, connections };
  const row = {
    ...(id ? { id } : {}),
    name: templateName,
    template,
    ...(current_nodes ? { current_nodes: JSON.stringify(current_nodes) } : {}),
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('tb_pr_workflow_template_json')
    .upsert([row], { onConflict: 'id' })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, template: data?.[0] });
}

// GET: 전체 템플릿 리스트 반환
export async function GET(req: NextRequest) {
  //템플릿 전체리스트가 아닌 title만 사용해서 호출
  //const {searchParams} = new URL(req.url);
  //const type = searchParams.get('type');

  // 모든 템플릿의 최신 버전들 조회
  const { data, error } = await supabase
    .from('tb_pr_workflow_template_json')
    .select('id,version, title, created_at')
    .eq('del_yn', false)
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates: data });
}
