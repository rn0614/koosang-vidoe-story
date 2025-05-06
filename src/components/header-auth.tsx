import { signOutAction } from '@/app/api/auth/actions';
import { Link } from '@/i18n/navigation';
import { Button } from './ui/button';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';

export default async function AuthButton() {
  const supabase = await createClient();
  const t = await getTranslations('main_menu');

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
        <Link href="/sign-in">{t('sign-in')}</Link>
      </Button>
      <Button asChild size="sm" variant={'default'}>
        <Link href="/sign-up">{t('sign-up')}</Link>
      </Button>
    </div>
  );
}
