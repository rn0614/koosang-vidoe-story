// src/app/api/ai-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = await createClient();

  console.log('body',body)
  const { data, error } = await supabase
    .from('ai_image')
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data , success: true});
}