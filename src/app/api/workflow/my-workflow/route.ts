import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// GET: 특정 id의 워크플로우(템플릿) 반환
export async function GET(req: NextRequest) {
  const { data, error } = await supabase
    .from('tb_pr_workflow_json')
    .select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ workflow: data });
}

// POST: 워크플로우 저장 (name, workflow(jsonb), created_at)
export async function POST(req: NextRequest) {
  const { name, workflow, template_id } = await req.json();
  const row = {
    name: name || `workflow_${Date.now()}`,
    workflow,
    template_id,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('tb_pr_workflow_json')
    .insert([row])
    .select();

  console.log('data', data);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, workflow: data });
}
