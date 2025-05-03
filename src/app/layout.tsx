import HeaderAuth from '@/components/header-auth';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import QueryProvider from '@/provider/query-provider';
import { ResponsiveSidebar } from '@/components/responsive-sidebar';
import ResponsiveAppLogo from '@/components/responsive-app-logo';
import { detectPlatform } from '@/lib/user-agent';
import { Drawer, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const platform = await detectPlatform();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content={
            platform === 'mobile'
              ? 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, height=1'
              : 'width=device-width, initial-scale=1'
          }
        />
      </head>
      <body className="bg-background text-foreground">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex min-h-screen flex-col items-center pt-16">
              <Drawer direction="left">
                <div className="flex w-full flex-1 flex-col items-center gap-20">
                  <header className="fixed left-0 top-0 z-50 flex h-16 w-full justify-center border-b border-b-foreground/10 bg-background">
                    <div className="flex w-full items-center justify-between p-3 px-5 text-sm">
                      <div className="flex items-center gap-5 font-semibold">
                        <DrawerTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label="메뉴 열기"
                          >
                            <span className="text-2xl">☰</span>
                          </Button>
                        </DrawerTrigger>
                        <Link href="/" className="font-semibold">
                          koo logo
                        </Link>
                      </div>
                      <HeaderAuth />
                    </div>
                  </header>
                  <div className="flex w-full">
                    <ResponsiveSidebar />
                    <div className="flex flex-1 flex-col gap-20 p-5">
                      {children}
                    </div>
                  </div>

                  <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
                    <p>
                      Powered by{' '}
                      <a
                        href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                        target="_blank"
                        className="font-bold hover:underline"
                        rel="noreferrer"
                      >
                        Supabase
                      </a>
                    </p>
                    <ThemeSwitcher />
                  </footer>
                </div>
              </Drawer>
            </main>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
