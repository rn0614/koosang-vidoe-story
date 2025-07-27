'use client';
import React, { useCallback } from 'react';
import { SidebarMenu } from '@/components/layout/sidebar-menu';
import { SIDEBAR_MENU } from '@/constants/menu';

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
      <SidebarMenu menu={SIDEBAR_MENU} />
    </div>
  );
} 