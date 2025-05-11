import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';


export async function GET() {
  const supabase = await createClient();
  const { data: documents, error } = await supabase.from('documents').select('id, content, metadata');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ documents });
}