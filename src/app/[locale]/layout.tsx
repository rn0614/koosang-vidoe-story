import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import HeaderAuth from '@/components/header-auth';
import { ResponsiveSidebar } from '@/components/responsive-sidebar';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Drawer, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { LocaleSelect } from '@/components/locale-select';
import QueryProvider from '@/provider/query-provider';
import { ThemeProvider } from 'next-themes';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextIntlClientProvider locale={locale}>
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
                        <div className="flex items-center gap-2">
                          <LocaleSelect locale={locale} />
                          <ThemeSwitcher />
                          <HeaderAuth />
                        </div>
                      </div>
                    </header>
                    <div className="flex w-full">
                      <ResponsiveSidebar />
                      <div className="flex flex-1 flex-col gap-20 p-5 md:ml-56">
                        {children}
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
                    </div>
                  </div>
                </Drawer>
              </main>
            </NextIntlClientProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
