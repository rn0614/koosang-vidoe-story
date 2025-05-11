'use client';
import { SIDEBAR_MENU } from '@/constants/menu';
import { Button } from '@/components/ui/button';
import {
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { usePathname } from '@/i18n/navigation';
import { SidebarMenu } from './sidebar-menu';

export function ResponsiveSidebar() {
  const pathname = usePathname();
  return (
    <>
      {/* 모바일: Drawer 트리거(햄버거 버튼) */}
      <div className="fixed left-4 top-4 z-50 block">
        <DrawerContent>
          <div className="mx-auto h-full w-full max-w-xs">
            <DrawerTitle>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" aria-label="메뉴 열기">
                  <span className="text-2xl">☰</span>
                </Button>
              </DrawerTrigger>
              <DrawerClose asChild>
                <span className="font-semibold">koo logo</span>
              </DrawerClose>
            </DrawerTitle>
            <div className="h-full overflow-y-auto">
              <SidebarMenu menu={SIDEBAR_MENU} />
            </div>
          </div>
        </DrawerContent>
      </div>

      {/* 데스크톱: 항상 보이는 사이드바 */}
      <nav className="fixed hidden h-full w-56 overflow-y-auto rounded-lg bg-gray-100 p-4 shadow dark:bg-gray-800 md:block">
        <SidebarMenu menu={SIDEBAR_MENU} />
      </nav>
    </>
  );
}
