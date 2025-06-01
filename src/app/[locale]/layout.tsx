import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import HeaderAuth from '@/components/header-auth';
import { ResponsiveSidebar } from '@/components/responsive-sidebar';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Drawer, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import QueryProvider from '@/provider/query-provider';
import { ThemeProvider } from 'next-themes';
import { getMessages } from 'next-intl/server';
import { Metadata } from 'next';
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Blog',
  verification: {
    google: 'iD2KMxJcc8CPlfXVwS2U_wyOuU2cGTdWP3FzV0cfTNw',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;  // 클라이언트에게 모든 메시지를 제공합니다.
  // side is the easiest way to get started
  const messages = await getMessages();
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
            <NextIntlClientProvider messages={messages}>
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
                          <HeaderAuth />
                        </div>
                      </div>
                    </header>
                    <div className="flex w-full">
                      <ResponsiveSidebar locale={locale} />
                      <div className="flex flex-1 flex-col gap-20 md:ml-56 min-w-[0px]">
                        {children}
                        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
                          <div className="flex flex-col items-center gap-2 w-full">
                            <div className="font-bold">koo sangmo 블로그</div>
                            <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
                              <a
                                href="https://github.com/rn0614"
                                target="_blank"
                                className="hover:underline text-blue-700"
                                rel="noreferrer"
                              >
                                Github 바로가기
                              </a>
                              {/* <a
                                href="https://play.google.com/store/apps/details?id=com.koosangmo.app"
                                target="_blank"
                                className="hover:underline text-green-700"
                                rel="noreferrer"
                              >
                                Google Play 앱 다운로드
                              </a> */}
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
                      </div>
                    </div>
                  </div>
                </Drawer>
              </main>
            </NextIntlClientProvider>
          </ThemeProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
