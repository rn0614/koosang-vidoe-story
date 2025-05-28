// src/app/api/ai-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createClient();

  console.log('body', body);
  const { data, error } = await supabase
    .from('ai_image')
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data, success: true });
}


export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  
  const limit = parseInt(searchParams.get('limit') || '8');
  const recentDays = searchParams.get('recentDays') ? parseInt(searchParams.get('recentDays')!) : null;

  let query = supabase
    .from('ai_image')
    .select('image_url, title, description, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  // 최근 N일 필터링
  if (recentDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - recentDays);
    query = query.gte('created_at', cutoffDate.toISOString());
  }

  const { data: imagesData, count, error } = await query.limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ imagesData, count });
}
