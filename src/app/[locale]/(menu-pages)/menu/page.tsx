'use client';
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

const MENUS = [
  { key: 'alarm', label: 'Alarm', href: '/alarm' },
  { key: 'workflow', label: 'Workflow', href: '/workflow/template' },
];

type MenuType = typeof MENUS[number];

export default function MenuPage() {
  const isWebView = typeof window !== 'undefined' && window.ReactNativeWebView;

  // WebView 메시지 전송 함수 (rag/page.tsx와 동일 패턴)
  const sendWebViewMessage = useCallback((menu: MenuType) => {
    if (isWebView) {
      const message = {
        type: 'ROUTER_EVENT',
        data: menu.href,
        title: menu.label,
        params: {
          menuKey: menu.key,
          menuLabel: menu.label,
        },
        navigationMode: 'push',
      };
      window.ReactNativeWebView?.postMessage(JSON.stringify(message));
    }
  }, [isWebView]);

  const handleMenuClick = useCallback(
    (e: React.MouseEvent, menu: MenuType) => {
      if (isWebView) {
        e.preventDefault();
        sendWebViewMessage(menu);
      }
    },
    [isWebView, sendWebViewMessage]
  );

  return (
    <div className="mx-auto w-full max-w-md p-4 space-y-4">
      <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-gray-100">메뉴</h2>
      {MENUS.map((menu) => (
        <Card key={menu.key} className="hover:shadow-lg transition">
          <Link href={menu.href} onClick={(e) => handleMenuClick(e, menu)}>
            <CardHeader>
              <CardTitle>{menu.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">이동</Button>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
} 