import { createClient } from '@/shared/lib/supabase/client';
import type { Database, Json } from '@/shared/types/database.types';
import type { BoxData } from '@/entities/box';

// Supabase 타입 정의
export type Container3D = Database['public']['Tables']['tb_3d_container']['Row'];
export type Container3DInsert = Database['public']['Tables']['tb_3d_container']['Insert'];
export type Container3DUpdate = Database['public']['Tables']['tb_3d_container']['Update'];

export type ObjectPosition = Database['public']['Tables']['tb_3d_object_positions']['Row'];
export type ObjectPositionInsert = Database['public']['Tables']['tb_3d_object_positions']['Insert'];
export type ObjectPositionUpdate = Database['public']['Tables']['tb_3d_object_positions']['Update'];

// 클라이언트측 타입 정의
export interface Container3DData {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  depth: number;
  settings?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface ObjectPositionData {
  id: string;
  container_id: string;
  object_id: string;
  object_type: string;
  name: string | null;
  x: number;
  y: number;
  z: number;
  size_x: number;
  size_y: number;
  size_z: number;
  rotation_x?: number;
  rotation_y?: number;
  rotation_z?: number;
  color: string;
  opacity?: number;
  is_static?: boolean;
  mass?: number;
  properties: Json | null;
  created_at: string;
  updated_at: string;
}

// BoxData와 ObjectPositionData 간 변환 함수
export const boxDataToObjectPosition = (
  boxData: BoxData, 
  containerId: string
): Omit<ObjectPositionInsert, 'id' | 'created_at' | 'updated_at'> => ({
  container_id: containerId,
  object_id: boxData.id,
  object_type: 'box',
  name: `박스 ${boxData.id}`,
  x: boxData.x,
  y: boxData.y,
  z: boxData.z,
  size_x: boxData.lenX,
  size_y: boxData.lenY,
  size_z: boxData.lenZ,
  rotation_x: 0,
  rotation_y: 0,
  rotation_z: 0,
  color: boxData.color,
  opacity: 1.0,
  is_static: false,
  mass: 1.0,
  properties: {}
});

export const objectPositionToBoxData = (objPos: ObjectPositionData): BoxData => ({
  id: objPos.object_id,
  x: objPos.x,
  y: objPos.y,
  z: objPos.z,
  lenX: objPos.size_x,
  lenY: objPos.size_y,
  lenZ: objPos.size_z,
  color: objPos.color,
  ref: { current: null } // ref는 런타임에 설정됨
});

// Container API
export const containerApi = {
  // ==========================================
  // 컨테이너 관리
  // ==========================================

  // 사용자의 활성 컨테이너 목록 조회
  async getContainersList(): Promise<Container3D[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tb_3d_container')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('컨테이너 목록 조회 실패:', error);
      throw new Error('컨테이너 목록을 불러오는데 실패했습니다.');
    }

    return data || [];
  },

  // 특정 컨테이너 조회
  async getContainer(containerId: string): Promise<Container3D | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tb_3d_container')
      .select('*')
      .eq('id', containerId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('컨테이너 조회 실패:', error);
      throw new Error('컨테이너를 불러오는데 실패했습니다.');
    }

    return data;
  },

  // 컨테이너 생성
  async createContainer(containerData: Omit<Container3DInsert, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Container3D> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tb_3d_container')
      .insert(containerData)
      .select()
      .single();

    if (error) {
      console.error('컨테이너 생성 실패:', error);
      throw new Error('컨테이너 생성에 실패했습니다.');
    }

    return data;
  },

  // 컨테이너 업데이트
  async updateContainer(containerId: string, updates: Container3DUpdate): Promise<Container3D> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tb_3d_container')
      .update(updates)
      .eq('id', containerId)
      .select()
      .single();

    if (error) {
      console.error('컨테이너 업데이트 실패:', error);
      throw new Error('컨테이너 업데이트에 실패했습니다.');
    }

    return data;
  },

  // 컨테이너 삭제 (소프트 삭제)
  async deleteContainer(containerId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('tb_3d_container')
      .update({ is_active: false })
      .eq('id', containerId);

    if (error) {
      console.error('컨테이너 삭제 실패:', error);
      throw new Error('컨테이너 삭제에 실패했습니다.');
    }
  },

  // ==========================================
  // 오브젝트 위치 관리
  // ==========================================

  // 특정 컨테이너의 모든 오브젝트 조회
  async getContainerObjects(containerId: string): Promise<ObjectPosition[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tb_3d_object_positions')
      .select('*')
      .eq('container_id', containerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('오브젝트 목록 조회 실패:', error);
      throw new Error('오브젝트 목록을 불러오는데 실패했습니다.');
    }

    return data || [];
  },

  // 특정 컨테이너의 박스 타입 오브젝트만 조회
  async getContainerBoxes(containerId: string): Promise<BoxData[]> {
    const objects = await this.getContainerObjects(containerId);
    const boxes = objects.filter(obj => obj.object_type === 'box');
    return boxes.map(objectPositionToBoxData);
  },

  // 오브젝트 생성
  async createObject(objectData: Omit<ObjectPositionInsert, 'id' | 'created_at' | 'updated_at'>): Promise<ObjectPositionData> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tb_3d_object_positions')
      .insert(objectData)
      .select()
      .single();

    if (error) {
      console.error('오브젝트 생성 실패:', error);
      throw new Error('오브젝트 생성에 실패했습니다.');
    }

    return data;
  },

  // 박스 생성 (편의 함수)
  async createBox(boxData: BoxData, containerId: string): Promise<ObjectPositionData> {
    const objectData = boxDataToObjectPosition(boxData, containerId);
    return this.createObject(objectData);
  },

  // 오브젝트 업데이트
  async updateObject(objectId: string, updates: ObjectPositionUpdate): Promise<ObjectPositionData> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tb_3d_object_positions')
      .update(updates)
      .eq('id', objectId)
      .select()
      .single();

    if (error) {
      console.error('오브젝트 업데이트 실패:', error);
      throw new Error('오브젝트 업데이트에 실패했습니다.');
    }

    return data;
  },

  // 박스 위치 업데이트 (편의 함수)
  async updateBoxPosition(containerId: string, boxId: string, x: number, y: number, z: number): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('tb_3d_object_positions')
      .update({ x, y, z })
      .eq('container_id', containerId)
      .eq('object_id', boxId)
      .eq('object_type', 'box');

    if (error) {
      console.error('박스 위치 업데이트 실패:', error);
      throw new Error('박스 위치 업데이트에 실패했습니다.');
    }
  },

  // 박스 크기 업데이트 (편의 함수)
  async updateBoxDimensions(containerId: string, boxId: string, sizeX: number, sizeY: number, sizeZ: number): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('tb_3d_object_positions')
      .update({ 
        size_x: sizeX, 
        size_y: sizeY, 
        size_z: sizeZ 
      })
      .eq('container_id', containerId)
      .eq('object_id', boxId)
      .eq('object_type', 'box');

    if (error) {
      console.error('박스 크기 업데이트 실패:', error);
      throw new Error('박스 크기 업데이트에 실패했습니다.');
    }
  },

  // 오브젝트 삭제
  async deleteObject(objectId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('tb_3d_object_positions')
      .delete()
      .eq('id', objectId);

    if (error) {
      console.error('오브젝트 삭제 실패:', error);
      throw new Error('오브젝트 삭제에 실패했습니다.');
    }
  },

  // 박스 삭제 (편의 함수)
  async deleteBox(containerId: string, boxId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('tb_3d_object_positions')
      .delete()
      .eq('container_id', containerId)
      .eq('object_id', boxId)
      .eq('object_type', 'box');

    if (error) {
      console.error('박스 삭제 실패:', error);
      throw new Error('박스 삭제에 실패했습니다.');
    }
  },

  // ==========================================
  // 배치 작업
  // ==========================================

  // 여러 오브젝트 일괄 생성
  async createMultipleObjects(objectsData: Array<Omit<ObjectPositionInsert, 'id' | 'created_at' | 'updated_at'>>): Promise<ObjectPositionData[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tb_3d_object_positions')
      .insert(objectsData)
      .select();

    if (error) {
      console.error('다중 오브젝트 생성 실패:', error);
      throw new Error('오브젝트들 생성에 실패했습니다.');
    }

    return data || [];
  },

  // 컨테이너의 모든 오브젝트 일괄 업데이트 (박스 데이터로)
  async syncContainerBoxes(containerId: string, boxes: BoxData[]): Promise<void> {
    const supabase = createClient();
    
    // 기존 박스들 삭제
    await supabase
      .from('tb_3d_object_positions')
      .delete()
      .eq('container_id', containerId)
      .eq('object_type', 'box');

    // 새 박스들 생성
    if (boxes.length > 0) {
      const objectsData = boxes.map(box => boxDataToObjectPosition(box, containerId));
      await this.createMultipleObjects(objectsData);
    }
  }
};

