import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// GET: 전체 workflow목록 반환
export async function GET() {
  const { data, error } = await supabase
    .from('tb_pr_workflow_json')
    .select('id, name, template, created_at')
    .order('created_at', { ascending: false });

  console.log('get data', data);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ templates: data });
}
