-- ==========================================
-- 3D 컨테이너 테이블 생성
-- ==========================================
CREATE TABLE public.tb_3d_container (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- 컨테이너 크기 정보
  width DECIMAL(10,2) DEFAULT 50.0,
  height DECIMAL(10,2) DEFAULT 50.0,
  depth DECIMAL(10,2) DEFAULT 50.0,
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  
  -- 추가 설정 (JSON 형태로 확장 가능)
  settings JSONB DEFAULT '{}',
  
  -- 상태 관리
  is_active BOOLEAN DEFAULT true
);

-- ==========================================
-- 3D 오브젝트 위치 테이블 생성
-- ==========================================
CREATE TABLE public.tb_3d_object_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  container_id UUID REFERENCES public.tb_3d_container(id) ON DELETE CASCADE,
  
  -- 오브젝트 식별 정보
  object_id VARCHAR(100) NOT NULL, -- BOX-001, SPHERE-001, CYLINDER-001 등
  object_type VARCHAR(50) NOT NULL DEFAULT 'box', -- box, sphere, cylinder, custom 등
  name VARCHAR(255),
  
  -- 위치 정보 (3D 좌표)
  x DECIMAL(10,2) NOT NULL DEFAULT 0,
  y DECIMAL(10,2) NOT NULL DEFAULT 2,
  z DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- 크기 정보 (오브젝트 타입에 따라 다르게 해석)
  size_x DECIMAL(10,2) NOT NULL DEFAULT 2, -- 박스: 길이, 구: 반지름, 실린더: 반지름
  size_y DECIMAL(10,2) NOT NULL DEFAULT 2, -- 박스: 높이, 구: 반지름, 실린더: 높이  
  size_z DECIMAL(10,2) NOT NULL DEFAULT 2, -- 박스: 깊이, 구: 반지름, 실린더: 반지름
  
  -- 회전 정보 (라디안)
  rotation_x DECIMAL(10,4) DEFAULT 0,
  rotation_y DECIMAL(10,4) DEFAULT 0,
  rotation_z DECIMAL(10,4) DEFAULT 0,
  
  -- 스타일 정보
  color VARCHAR(7) DEFAULT '#4299e1', -- HEX 색상
  opacity DECIMAL(3,2) DEFAULT 1.0,   -- 투명도 (0.0 ~ 1.0)
  
  -- 물리 속성
  is_static BOOLEAN DEFAULT false,     -- 정적 오브젝트 여부
  mass DECIMAL(10,2) DEFAULT 1.0,     -- 질량
  
  -- 추가 속성 (JSON 형태로 확장 가능)
  properties JSONB DEFAULT '{}',
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제약 조건: 같은 컨테이너 내에서 object_id 중복 방지
  UNIQUE(container_id, object_id)
);

-- ==========================================
-- 인덱스 생성 (성능 최적화)
-- ==========================================

-- 컨테이너 테이블 인덱스
CREATE INDEX idx_tb_3d_container_user_id ON public.tb_3d_container(user_id);
CREATE INDEX idx_tb_3d_container_active ON public.tb_3d_container(is_active) WHERE is_active = true;
CREATE INDEX idx_tb_3d_container_created ON public.tb_3d_container(created_at DESC);

-- 오브젝트 위치 테이블 인덱스
CREATE INDEX idx_tb_3d_object_positions_container_id ON public.tb_3d_object_positions(container_id);
CREATE INDEX idx_tb_3d_object_positions_object_id ON public.tb_3d_object_positions(object_id);
CREATE INDEX idx_tb_3d_object_positions_type ON public.tb_3d_object_positions(object_type);
CREATE INDEX idx_tb_3d_object_positions_created ON public.tb_3d_object_positions(created_at DESC);

-- 복합 인덱스 (자주 함께 조회되는 컬럼들)
CREATE INDEX idx_tb_3d_object_positions_container_type ON public.tb_3d_object_positions(container_id, object_type);

-- ==========================================
-- RLS (Row Level Security) 정책 설정
-- ==========================================

-- RLS 활성화
ALTER TABLE public.tb_3d_container ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tb_3d_object_positions ENABLE ROW LEVEL SECURITY;

-- 컨테이너 정책: 사용자는 자신의 컨테이너만 관리 가능
CREATE POLICY "Users can manage their own 3D containers" ON public.tb_3d_container
  FOR ALL USING (auth.uid() = user_id);

-- 오브젝트 정책: 사용자는 자신의 컨테이너에 속한 오브젝트만 관리 가능
CREATE POLICY "Users can manage objects in their containers" ON public.tb_3d_object_positions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tb_3d_container 
      WHERE id = container_id AND user_id = auth.uid()
    )
  );

-- ==========================================
-- 트리거 함수 (updated_at 자동 업데이트)
-- ==========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 컨테이너 테이블 트리거
CREATE TRIGGER update_tb_3d_container_updated_at 
    BEFORE UPDATE ON public.tb_3d_container 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 오브젝트 위치 테이블 트리거
CREATE TRIGGER update_tb_3d_object_positions_updated_at 
    BEFORE UPDATE ON public.tb_3d_object_positions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 샘플 데이터 삽입
-- ==========================================

-- 샘플 3D 컨테이너 생성
INSERT INTO public.tb_3d_container (id, name, description, width, height, depth) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '메인 창고', '주요 물품 보관 창고', 50.0, 30.0, 40.0),
  ('550e8400-e29b-41d4-a716-446655440002', '보조 창고', '보조 물품 보관 창고', 30.0, 25.0, 30.0),
  ('550e8400-e29b-41d4-a716-446655440003', '테스트 영역', '개발 및 테스트용 영역', 20.0, 20.0, 20.0);

-- 샘플 박스 오브젝트 (메인 창고)
INSERT INTO public.tb_3d_object_positions (
  container_id, object_id, object_type, name, 
  x, y, z, size_x, size_y, size_z, color
) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'BOX-001', 'box', '박스 1', 2, 2, 2, 2, 2, 2, '#4299e1'),
  ('550e8400-e29b-41d4-a716-446655440001', 'BOX-002', 'box', '박스 2', 4, 2, 2, 2, 2, 2, '#48bb78'),
  ('550e8400-e29b-41d4-a716-446655440001', 'BOX-003', 'box', '박스 3', 6, 2, 2, 2, 2, 2, '#ed8936'),
  ('550e8400-e29b-41d4-a716-446655440001', 'BOX-004', 'box', '박스 4', 2, 2, 4, 2, 2, 2, '#9f7aea'),
  ('550e8400-e29b-41d4-a716-446655440001', 'BOX-005', 'box', '박스 5', 4, 2, 4, 2, 2, 2, '#f56565');

-- 샘플 다양한 오브젝트 (보조 창고)
INSERT INTO public.tb_3d_object_positions (
  container_id, object_id, object_type, name, 
  x, y, z, size_x, size_y, size_z, color
) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'BOX-001', 'box', '보조 박스 1', 3, 2, 3, 2, 2, 2, '#38b2ac'),
  ('550e8400-e29b-41d4-a716-446655440002', 'SPHERE-001', 'sphere', '구체 1', 6, 3, 3, 1.5, 1.5, 1.5, '#d69e2e'),
  ('550e8400-e29b-41d4-a716-446655440002', 'CYLINDER-001', 'cylinder', '원기둥 1', 9, 2, 3, 1, 3, 1, '#e53e3e');

-- ==========================================
-- 유용한 뷰 생성 (선택사항)
-- ==========================================

-- 컨테이너별 오브젝트 개수 뷰
CREATE VIEW v_container_object_count AS
SELECT 
  c.id,
  c.name,
  c.description,
  COUNT(o.id) as object_count,
  COUNT(CASE WHEN o.object_type = 'box' THEN 1 END) as box_count,
  COUNT(CASE WHEN o.object_type = 'sphere' THEN 1 END) as sphere_count,
  COUNT(CASE WHEN o.object_type = 'cylinder' THEN 1 END) as cylinder_count,
  c.created_at,
  c.updated_at
FROM public.tb_3d_container c
LEFT JOIN public.tb_3d_object_positions o ON c.id = o.container_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
ORDER BY c.created_at DESC;

-- ==========================================
-- 권한 설정
-- ==========================================

-- 인증된 사용자가 테이블에 접근할 수 있도록 권한 부여
GRANT ALL ON public.tb_3d_container TO authenticated;
GRANT ALL ON public.tb_3d_object_positions TO authenticated;
GRANT SELECT ON v_container_object_count TO authenticated;

-- 시퀀스 권한 (UUID 사용시 불필요하지만 안전을 위해)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;