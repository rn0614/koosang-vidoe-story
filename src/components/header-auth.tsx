import { signOutAction } from '@/app/api/auth/actions';
import { Link } from '@/i18n/navigation';
import { Button } from './ui/button';
import { createClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { buttonVariants } from '@/components/ui/button';

export default async function HeaderAuth() {
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
      <Link
        href="/sign-in"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        {t('sign-in')}
      </Link>
      <Link
        href="/sign-up"
        className={buttonVariants({ variant: 'default', size: 'sm' })}
      >
        {t('sign-up')}
      </Link>
    </div>
  );
}
