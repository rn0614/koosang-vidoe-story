import { signOutAction } from '@/app/api/auth/actions';
import Link from 'next/link';
import { Button } from './ui/button';
import { createClient } from '@/utils/supabase/server';
import { detectPlatform } from '@/lib/user-agent';

export default async function AuthButton() {
  const supabase = await createClient();
  const platform = await detectPlatform();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button type="submit" variant={'outline'}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={'outline'}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={'default'}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
