import HeaderAuth from './header-auth';
import { detectPlatform } from '@/shared/lib/user-agent';
import { headers } from 'next/headers';
import HeaderMenuButton from './header-menu-button';

export default async function Header() {
  const platform = await detectPlatform();
  const pathname =
    headers().get('x-invoke-path') || headers().get('next-url') || '/';
  console.log('pathname', pathname);

  return (
    <header className="fixed left-0 top-0 z-50 flex h-16 w-full justify-center border-b border-b-foreground/10 bg-background">
      <div className="flex w-full items-center justify-between p-3 px-5 text-sm">
        <div className="flex items-center gap-5 font-semibold">
          <HeaderMenuButton platform={platform} />
        </div>
        <div className="flex items-center gap-2">
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
