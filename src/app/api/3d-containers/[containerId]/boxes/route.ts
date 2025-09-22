import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

// GET /api/3d-containers/[containerId]/boxes - 특정 컨테이너의 박스 목록 조회
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

    // 컨테이너 존재 여부 확인
    const { data: container, error: containerError } = await supabase
      .from('tb_3d_container')
      .select('id, name')
      .eq('id', containerId)
      .eq('is_active', true)
      .single();

    if (containerError || !container) {
      return NextResponse.json(
        { error: '컨테이너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 박스 타입 오브젝트 조회
    const { data: boxes, error } = await supabase
      .from('tb_3d_object_positions')
      .select('*')
      .eq('container_id', containerId)
      .eq('object_type', 'box')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('박스 목록 조회 실패:', error);
      return NextResponse.json(
        { error: '박스 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // BoxData 형태로 변환
    const boxData = (boxes || []).map(box => ({
      id: box.object_id,
      x: box.x,
      y: box.y,
      z: box.z,
      lenX: box.size_x,
      lenY: box.size_y,
      lenZ: box.size_z,
      color: box.color,
      ref: { current: null } // 클라이언트에서 설정됨
    }));

    return NextResponse.json({
      boxes: boxData,
      count: boxData.length,
      container: {
        id: container.id,
        name: container.name
      }
    });

  } catch (error) {
    console.error(`GET /api/3d-containers/${params.containerId}/boxes 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/3d-containers/[containerId]/boxes - 컨테이너에 새 박스 추가
export async function POST(
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
    const { 
      object_id, 
      name, 
      x = 0, 
      y = 2, 
      z = 0, 
      size_x = 2, 
      size_y = 2, 
      size_z = 2, 
      color = '#4299e1',
      rotation_x = 0,
      rotation_y = 0,
      rotation_z = 0,
      opacity = 1.0,
      is_static = false,
      mass = 1.0,
      properties = {}
    } = body;

    // 유효성 검사
    if (!object_id || typeof object_id !== 'string') {
      return NextResponse.json(
        { error: '오브젝트 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    if (size_x <= 0 || size_y <= 0 || size_z <= 0) {
      return NextResponse.json(
        { error: '박스 크기는 0보다 커야 합니다.' },
        { status: 400 }
      );
    }

    // 컨테이너 존재 여부 확인
    const { data: container, error: containerError } = await supabase
      .from('tb_3d_container')
      .select('id')
      .eq('id', containerId)
      .eq('is_active', true)
      .single();

    if (containerError || !container) {
      return NextResponse.json(
        { error: '컨테이너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 중복 object_id 확인
    const { data: existingBox, error: checkError } = await supabase
      .from('tb_3d_object_positions')
      .select('id')
      .eq('container_id', containerId)
      .eq('object_id', object_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
      console.error('중복 확인 실패:', checkError);
      return NextResponse.json(
        { error: '중복 확인에 실패했습니다.' },
        { status: 500 }
      );
    }

    if (existingBox) {
      return NextResponse.json(
        { error: '이미 존재하는 박스 ID입니다.' },
        { status: 409 }
      );
    }

    // 박스 생성
    const { data: newBox, error } = await supabase
      .from('tb_3d_object_positions')
      .insert({
        container_id: containerId,
        object_id,
        object_type: 'box',
        name: name || `박스 ${object_id}`,
        x: Number(x),
        y: Number(y),
        z: Number(z),
        size_x: Number(size_x),
        size_y: Number(size_y),
        size_z: Number(size_z),
        rotation_x: Number(rotation_x),
        rotation_y: Number(rotation_y),
        rotation_z: Number(rotation_z),
        color: color || '#4299e1',
        opacity: Number(opacity),
        is_static: Boolean(is_static),
        mass: Number(mass),
        properties: properties || {}
      })
      .select()
      .single();

    if (error) {
      console.error('박스 생성 실패:', error);
      return NextResponse.json(
        { error: '박스 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // BoxData 형태로 변환하여 반환
    const boxData = {
      id: newBox.object_id,
      x: newBox.x,
      y: newBox.y,
      z: newBox.z,
      lenX: newBox.size_x,
      lenY: newBox.size_y,
      lenZ: newBox.size_z,
      color: newBox.color,
      ref: { current: null }
    };

    return NextResponse.json(
      { box: boxData },
      { status: 201 }
    );

  } catch (error) {
    console.error(`POST /api/3d-containers/${params.containerId}/boxes 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/3d-containers/[containerId]/boxes - 컨테이너의 모든 박스 일괄 업데이트
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
    const { boxes } = body;

    if (!Array.isArray(boxes)) {
      return NextResponse.json(
        { error: '박스 데이터는 배열이어야 합니다.' },
        { status: 400 }
      );
    }

    // 컨테이너 존재 여부 확인
    const { data: container, error: containerError } = await supabase
      .from('tb_3d_container')
      .select('id')
      .eq('id', containerId)
      .eq('is_active', true)
      .single();

    if (containerError || !container) {
      return NextResponse.json(
        { error: '컨테이너를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 트랜잭션으로 처리: 기존 박스 삭제 후 새 박스들 생성
    
    // 1. 기존 박스들 삭제
    const { error: deleteError } = await supabase
      .from('tb_3d_object_positions')
      .delete()
      .eq('container_id', containerId)
      .eq('object_type', 'box');

    if (deleteError) {
      console.error('기존 박스 삭제 실패:', deleteError);
      return NextResponse.json(
        { error: '기존 박스 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 2. 새 박스들 생성 (박스가 있는 경우에만)
    if (boxes.length > 0) {
      const boxesData = boxes.map((box: any) => ({
        container_id: containerId,
        object_id: box.id,
        object_type: 'box',
        name: `박스 ${box.id}`,
        x: Number(box.x || 0),
        y: Number(box.y || 2),
        z: Number(box.z || 0),
        size_x: Number(box.lenX || 2),
        size_y: Number(box.lenY || 2),
        size_z: Number(box.lenZ || 2),
        rotation_x: 0,
        rotation_y: 0,
        rotation_z: 0,
        color: box.color || '#4299e1',
        opacity: 1.0,
        is_static: false,
        mass: 1.0,
        properties: {}
      }));

      const { error: insertError } = await supabase
        .from('tb_3d_object_positions')
        .insert(boxesData);

      if (insertError) {
        console.error('새 박스 생성 실패:', insertError);
        return NextResponse.json(
          { error: '새 박스 생성에 실패했습니다.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: '박스 데이터가 성공적으로 동기화되었습니다.',
      count: boxes.length
    });

  } catch (error) {
    console.error(`PUT /api/3d-containers/${params.containerId}/boxes 오류:`, error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
