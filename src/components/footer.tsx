import { ThemeSwitcher } from './theme-switcher';

export default function Footer() {
  return (
    <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
      <div className="flex w-full flex-col items-center gap-2">
        <div className="font-bold">koo sangmo 블로그</div>
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
          <a
            href="https://github.com/rn0614"
            target="_blank"
            className="text-blue-700 hover:underline"
            rel="noreferrer"
          >
            Github 바로가기
          </a>
        </div>
        <div className="mt-2">
          Powered by{' '}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
            className="font-bold hover:underline"
          >
            Vercel
          </a>
          {' & '}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
            className="font-bold hover:underline"
          >
            Supabase
          </a>
        </div>
      </div>
      <ThemeSwitcher />
    </footer>
  );
}
