import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


export async function GET() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase.from('schedule').select().order('created_at', {ascending:false});
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ notes });
}