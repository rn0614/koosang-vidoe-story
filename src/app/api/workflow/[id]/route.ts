import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// POST: 템플릿 전체를 jsonb로 저장 (id가 있으면 upsert, 없으면 insert)
export async function POST(req: NextRequest) {
  const { id, name, nodes, connections, current_nodes } = await req.json();
  const templateName = name || `my_${Date.now()}`;
  const template = { nodes, connections };
  const row = {
    ...(id ? { id } : {}),
    name: templateName,
    workflow:template,
    ...(current_nodes ? { "current_nodes":current_nodes} : {}),
    created_at: new Date().toISOString(),
  };

  console.log('row', row);
  const { data, error } = await supabase
    .from('tb_pr_workflow_template_json')
    .upsert([row], { onConflict: 'id' })
    .select();
  if (error) {
    console.log('error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, template: data?.[0] });
}

// GET: 특정 id의 워크플로우(템플릿) 반환
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { data, error } = await supabase
    .from('tb_pr_workflow_json')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.log('error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ workflow: data });
}
