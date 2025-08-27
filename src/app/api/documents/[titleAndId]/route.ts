import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';


export async function GET(
  request: NextRequest,
  { params }: { params: { titleAndId: string } }
) {
  const supabase = await createClient();
  const { titleAndId } = params;
  const id = titleAndId.split('--').pop();

  const { data: documents, error } = await supabase
    .from('documents')
    .select('id, content, metadata')
    .eq('id', id);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ documents });
}