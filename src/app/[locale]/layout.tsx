import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ResponsiveSidebar } from '@/components/layout/responsive-sidebar';
import { Drawer, DrawerTrigger } from '@/components/ui/drawer';
import QueryProvider from '@/provider/query-provider';
import { ThemeProvider } from 'next-themes';
import { getMessages } from 'next-intl/server';
import { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

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
  const { locale } = params; // 클라이언트에게 모든 메시지를 제공합니다.
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <html lang={locale} >
      <body>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextIntlClientProvider messages={messages}>
              <main className="flex min-h-screen flex-col pt-16">
                <Drawer direction="left">
                  <div className="flex w-full flex-1 min-h-0 flex-col items-center gap-20">
                    <Header />
                    <div className="flex w-full flex-1 min-h-0">
                      <ResponsiveSidebar locale={locale} />
                      <div className="flex min-w-0 flex-1 flex-col gap-20 md:ml-56">
                        {children}
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
