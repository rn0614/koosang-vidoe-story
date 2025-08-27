import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';


export async function GET() {
  const supabase = await createClient();
  const { data: notes, error } = await supabase.from('notes').select().order('created_at', {ascending:false});
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const { title } = await req.json();
  const supabase = await createClient();
  const { error } = await supabase.from('notes').insert([{ title }]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}


export async function PATCH(req: NextRequest) {
  const { id, title, updated_at } = await req.json();
  const supabase = await createClient();
  const { error } = await supabase
    .from('notes')
    .update({ title, updated_at })
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
