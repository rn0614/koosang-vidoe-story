import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

// GET /api/3d-containers - 사용자의 컨테이너 목록 조회
export async function GET() {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 컨테이너 목록 조회
    const { data: containers, error } = await supabase
      .from('tb_3d_container')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('컨테이너 목록 조회 실패:', error);
      return NextResponse.json(
        { error: '컨테이너 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      containers: containers || [],
      count: containers?.length || 0
    });

  } catch (error) {
    console.error('GET /api/3d-containers 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/3d-containers - 새 컨테이너 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const { name, description, width = 50, height = 30, depth = 40, settings = {} } = body;

    // 유효성 검사
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: '컨테이너 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    if (width <= 0 || height <= 0 || depth <= 0) {
      return NextResponse.json(
        { error: '컨테이너 크기는 0보다 커야 합니다.' },
        { status: 400 }
      );
    }

    // 컨테이너 생성
    const { data: container, error } = await supabase
      .from('tb_3d_container')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        width: Number(width),
        height: Number(height),
        depth: Number(depth),
        settings: settings || {},
        is_active: true,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('컨테이너 생성 실패:', error);
      return NextResponse.json(
        { error: '컨테이너 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { container },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/3d-containers 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
