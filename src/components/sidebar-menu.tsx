import { useRouter } from '@/i18n/navigation';
import { DrawerClose } from './ui/drawer';
import { MenuItem } from '@/types/menu';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { MAIN_MENU } from '@/constants/menu';

export function SidebarMenu({ menu }: { menu: MenuItem[] }) {
  const t = useTranslations('main_menu');
  const router = useRouter();
  const isWebView = typeof window !== 'undefined' && window.ReactNativeWebView;

  const mainMenuRoutes = MAIN_MENU.map((item) => item.href);

  const sendMainMenuMessage = useCallback(
    (href: string) => {
      const message = {
        type: 'ROUTER_EVENT',
        data: href,
        navigationMode: 'tab_switch',
        isMainMenu: true,
      };

      console.log('Sending main menu message:', message);
      window.ReactNativeWebView?.postMessage(JSON.stringify(message));
    },
    [isWebView],
  );

  const handleWebViewClick = useCallback(
    (e: React.MouseEvent, item: MenuItem) => {
      if (isWebView && mainMenuRoutes.includes(item.href)) {
        sendMainMenuMessage(item.href);
      } else {
        router.push(item.href);
      }
    },
    [sendMainMenuMessage],
  );

  return (
    <ul className="flex flex-col gap-2 p-4">
      {menu.map((item) => (
        <li key={item.href} className="w-full">
          <DrawerClose asChild>
            {item.clickable ? (
              <div
                className="block w-full rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={(e) => handleWebViewClick(e, item)}
              >
                {item.icon}
                {t(item.labelKey)}
              </div>
            ) : (
              <div className="block w-full rounded px-3 py-2">
                {item.icon}
                {t(item.labelKey)}
              </div>
            )}
          </DrawerClose>
          {item.children && item.children.length > 0 && (
            <SidebarMenu menu={item.children} />
          )}
        </li>
      ))}
    </ul>
  );
}
