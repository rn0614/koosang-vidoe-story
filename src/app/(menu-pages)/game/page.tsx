import { createClient } from '@/utils/supabase/server';

export default async function GamePage() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from('notes').select();

  return (
    <>
      <div>game</div>
      <div>{notes?.map((note) => <div key={note.id}>{note.title}</div>)}</div>
    </>
  );
}
