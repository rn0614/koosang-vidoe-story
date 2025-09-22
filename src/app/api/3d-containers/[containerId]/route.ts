import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

// GET /api/3d-containers/[containerId] - 특정 컨테이너 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { containerId: string } }
) {
  try {
    const supabase = await createClient();
    const { containerId } = params;

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(containerId)) {
      return NextResponse.json(
        { error: '유효하지 않은 컨테이너 ID입니다.' },
        { status: 400 }
      );
    }

    // 컨테이너 조회
    const { data: container, error } = await supabase
      .from('tb_3d_container')
      .select('*')
      .eq('id', containerId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('컨테이너 조회 실패:', error);
      return NextResponse.json(
        { error: '컨테이너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ container });

  } catch (error) {
    console.error(`GET /api/3d-containers/${params.containerId} 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/3d-containers/[containerId] - 컨테이너 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: { containerId: string } }
) {
  try {
    const supabase = await createClient();
    const { containerId } = params;

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
    const { name, description, width, height, depth, settings } = body;

    // 업데이트할 필드만 포함
    const updates: any = {};
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: '컨테이너 이름은 필수입니다.' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (width !== undefined) {
      if (width <= 0) {
        return NextResponse.json(
          { error: '컨테이너 너비는 0보다 커야 합니다.' },
          { status: 400 }
        );
      }
      updates.width = Number(width);
    }

    if (height !== undefined) {
      if (height <= 0) {
        return NextResponse.json(
          { error: '컨테이너 높이는 0보다 커야 합니다.' },
          { status: 400 }
        );
      }
      updates.height = Number(height);
    }

    if (depth !== undefined) {
      if (depth <= 0) {
        return NextResponse.json(
          { error: '컨테이너 깊이는 0보다 커야 합니다.' },
          { status: 400 }
        );
      }
      updates.depth = Number(depth);
    }

    if (settings !== undefined) {
      updates.settings = settings || {};
    }

    // 업데이트할 필드가 없는 경우
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '업데이트할 필드가 없습니다.' },
        { status: 400 }
      );
    }

    // 컨테이너 업데이트
    const { data: container, error } = await supabase
      .from('tb_3d_container')
      .update(updates)
      .eq('id', containerId)
      .select()
      .single();

    if (error) {
      console.error('컨테이너 업데이트 실패:', error);
      return NextResponse.json(
        { error: '컨테이너 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ container });

  } catch (error) {
    console.error(`PUT /api/3d-containers/${params.containerId} 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/3d-containers/[containerId] - 컨테이너 삭제 (소프트 삭제)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { containerId: string } }
) {
  try {
    const supabase = await createClient();
    const { containerId } = params;

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 컨테이너 소프트 삭제 (is_active = false)
    const { error } = await supabase
      .from('tb_3d_container')
      .update({ is_active: false })
      .eq('id', containerId);

    if (error) {
      console.error('컨테이너 삭제 실패:', error);
      return NextResponse.json(
        { error: '컨테이너 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '컨테이너가 성공적으로 삭제되었습니다.' },
      { status: 200 }
    );

  } catch (error) {
    console.error(`DELETE /api/3d-containers/${params.containerId} 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
