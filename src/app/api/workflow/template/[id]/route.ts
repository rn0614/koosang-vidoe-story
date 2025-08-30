import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }) {
  const { id } = params;

  const { data, error } = await supabase
    .from('tb_pr_workflow_template_json')
    .update({
      deleted_at: new Date().toISOString(),
      del_yn: true, // 테이블 컬럼명과 일치
    })
    .eq('id', id)
    .eq('del_yn', false); // 활성 버전만 삭제

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }) {
  const { id } = params;
  const { name, nodes, connections, current_nodes } = await request.json();
  const templateName = name || `my_${Date.now()}`;
  const template = { nodes, connections };

  try {
    // 1. 기존 활성 버전을 논리삭제하면서 최대 버전도 조회
    const { data: deletedData, error: deleteError } = await supabase
      .from('tb_pr_workflow_template_json')
      .update({
        deleted_at: new Date().toISOString(),
        del_yn: true,
      })
      .eq('id', id)
      .eq('del_yn', false)
      .select('version'); // 삭제되는 레코드의 버전을 반환

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 삭제된 레코드의 최대 버전 + 1
    const maxVersion = Math.max(...(deletedData?.map((d) => d.version) || [0]));
    const nextVersion = maxVersion + 1;

    // 2. 새 버전 생성
    const row = {
      id: id,
      version: nextVersion,
      title: templateName,
      template: template,
      current_nodes: current_nodes,
      created_at: new Date().toISOString(),
      del_yn: false,
    };

    const { data, error } = await supabase
      .from('tb_pr_workflow_template_json')
      .insert([row])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      template: data?.[0],
      version: nextVersion,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log('params', params);
  const id = params.id;
  try {
    // 특정 템플릿의 최신 버전 조회
    const { data, error } = await supabase
      .from('tb_pr_workflow_template_json')
      .select('*')
      .eq('id', id)
      .eq('del_yn', false)
      .order('version', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data?.[0] });
  } catch (err) {
    console.error('GET error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
