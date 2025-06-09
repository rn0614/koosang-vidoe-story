import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// POST: 템플릿 전체를 jsonb로 저장 (id가 있으면 upsert, 없으면 insert)
export async function POST(req: NextRequest) {
  const { id, name, nodes, connections } = await req.json();
  const templateName = name || `템플릿_${Date.now()}`;
  const template = { nodes, connections };
  const row = {
    ...(id ? { id } : {}),
    name: templateName,
    template,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('tb_pr_workflow_json')
    .upsert([row], { onConflict: 'id' })
    .select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, template: data?.[0] });
}

// GET: 전체 템플릿 목록 반환
export async function GET() {
  const { data, error } = await supabase
    .from('tb_pr_workflow_template_json')
    .select('id, name, template, created_at')
    .order('created_at', { ascending: false });

  console.log('get data', data);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ templates: data });
}
