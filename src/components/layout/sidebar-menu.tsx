import { useRouter } from '@/i18n/navigation';
import { DrawerClose } from '../ui/drawer';
import { MenuItem } from '@/shared/types/menu';
import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MAIN_MENU } from '@/constants/menu';
import { ChevronRight, ChevronDown } from 'lucide-react';

export function SidebarMenu({ menu }: { menu: MenuItem[] }) {
  const t = useTranslations('main_menu');
  const router = useRouter();
  const isWebView = typeof window !== 'undefined' && window.ReactNativeWebView;

  const isMainMenu = (href: string) => {
    // 쿼리스트링을 제거한 기본 경로만 체크
    const basePath = href.split('?')[0];
    return ['/','/dashboard','/rag','/game','/3d','/menu'].includes(basePath);
  };

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = useCallback((href: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  }, []);

  const sendMainMenuMessage = useCallback(
    (href: string) => {
      const message = {
        type: 'ROUTER_EVENT',
        data: href,
        navigationMode: isMainMenu(href) ? 'tab_switch' : 'push',
        isMainMenu: true,
      };

      console.log('Sending main menu message:', message);
      window.ReactNativeWebView?.postMessage(JSON.stringify(message));
    },
    [isWebView],
  );

  const handleWebViewClick = useCallback(
    (e: React.MouseEvent, item: MenuItem) => {
      if (isWebView) {
        e.preventDefault();
        sendMainMenuMessage(item.href);
      } else {
        router.push(item.href);
      }
    },
    [isWebView,sendMainMenuMessage],
  );

  return (
    <ul className="flex flex-col gap-2 p-4">
      {menu.map((item) => {
        const hasChildren = !!item.children && item.children.length > 0;
        const isOpen = openMenus[item.href];
        if (hasChildren) {
          // Always render as accordion if has children
          return (
            <li key={item.href} className="w-full">
                <div
                  className="flex items-center w-full rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu(item.href);
                  }}
                >
                  {item.icon}
                  <span className="flex-1">{t(item.labelKey)}</span>
                  <span className="ml-2">
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>
                </div>
              {isOpen && (
                <div className="ml-4">
                  <SidebarMenu menu={item.children ?? []} />
                </div>
              )}
            </li>
          );
        }
        // No children: clickable or not
        return (
          <li key={item.href} className="w-full">
            <DrawerClose asChild>
              {item.clickable ? (
                <div
                  className="flex items-center w-full rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={(e) => handleWebViewClick(e, item)}
                >
                  {item.icon}
                  <span className="flex-1">{t(item.labelKey)}</span>
                </div>
              ) : (
                <div className="block w-full rounded px-3 py-2">
                  {item.icon}
                  {t(item.labelKey)}
                </div>
              )}
            </DrawerClose>
          </li>
        );
      })}
    </ul>
  );
}
