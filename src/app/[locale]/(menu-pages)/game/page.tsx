import { createClient } from '@/shared/lib/supabase/server';
import {Link} from '@/shared/lib/i18n/navigation';

export default async function GamePage() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from('notes').select();

  return (
    <>
      <div>game</div>
      <div>
        <Link href="/game/mincraft">mincraft</Link>
        <Link href="/game/boardgame">boardgame</Link>
      </div>
    </>
  );
}
