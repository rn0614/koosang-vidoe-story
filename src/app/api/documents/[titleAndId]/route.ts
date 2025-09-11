import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { titleAndId: string } }
) {
  try {
    const supabase = await createClient();
    const { titleAndId } = params;
    
    // titleAndId에서 ID 추출 (예: "제목--123" -> 123)
    const idString = titleAndId.split('--').pop();
    
    if (!idString) {
      return NextResponse.json(
        { error: 'Invalid document ID' }, 
        { status: 400 }
      );
    }

    const id = parseInt(idString, 10);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid document ID format' }, 
        { status: 400 }
      );
    }

    console.log('Fetching document with titleAndId:', titleAndId, 'id:', id);

    // 데이터베이스에서 문서 조회 (제네릭 타입으로 정확한 타입 보장)
    const { data: documents, error } = await supabase
      .from('documents')
      .select(`
        id, 
        content, 
        metadata, 
        thumbnail,
        path,
        updated_at,
        embedding
      `)
      .eq('id', id)
      .single(); // 단일 문서 조회
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: `Failed to fetch document: ${error.message}` }, 
        { status: 500 }
      );
    }

    if (!documents) {
      return NextResponse.json(
        { error: 'Document not found' }, 
        { status: 404 }
      );
    }

    // 단일 문서를 배열로 감싸서 반환 (기존 API 구조 유지)
    return NextResponse.json({ documents: [documents] });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}