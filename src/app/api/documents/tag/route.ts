import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  // raw SQL 실행
  const { data, error } = await supabase.rpc('count_tags'); 

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ tags: data });
}
