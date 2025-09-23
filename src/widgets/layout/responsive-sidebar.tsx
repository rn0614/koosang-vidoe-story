'use client';
import { SIDEBAR_MENU } from '@/shared/constants/menu';
import { Button } from '@/shared/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer';
import { SidebarMenu } from './sidebar-menu';
import { ThemeSwitcher } from '@/widgets/common/theme-switcher';
import { LocaleSelect } from '@/widgets/common/locale-select';

export function ResponsiveSidebar({ locale }: { locale: string }) {
  return (
    <>
      {/* 모바일: Drawer 트리거(햄버거 버튼) */}
      <div className="fixed left-4 top-4 z-50 block">
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon" aria-label="메뉴 열기">
              <span className="text-2xl">☰</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="w-80">
            <DrawerHeader>
              <DrawerTitle className="flex items-center">
                <div className="flex-1 items-center gap-2">
                  <span className="font-semibold">koo logo</span>
                </div>
                <DrawerClose asChild>
                  <Button variant="ghost" size="sm">
                    ✕
                  </Button>
                </DrawerClose>
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4">
              <SidebarMenu menu={SIDEBAR_MENU} />
            </div>
            <DrawerFooter>
              <div className="flex justify-center gap-2">
                <LocaleSelect locale={locale} />
                <ThemeSwitcher />
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      {/* 데스크톱: 항상 보이는 사이드바 */}
      <nav className="fixed hidden inset-0 w-56 flex flex-col rounded-lg bg-gray-100 shadow dark:bg-gray-800 md:flex">
        {/* 헤더 공간을 위한 빈 박스 */}
        <div className="h-16" />
        {/* 헤더 영역 */}
        <DrawerHeader>
          <DrawerTitle className="flex items-center">
            <div className="flex-1 items-center gap-2">
              <span className="font-semibold">koo logo</span>
            </div>
          </DrawerTitle>
        </DrawerHeader>
        {/* 메뉴 영역 - 남은 공간을 모두 차지하고 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4">
          <SidebarMenu menu={SIDEBAR_MENU} />
        </div>
        {/* 푸터 영역 */}
        <DrawerFooter>
          <div className="flex justify-center gap-2">
            <LocaleSelect locale={locale} />
            <ThemeSwitcher />
          </div>
        </DrawerFooter>
      </nav>
    </>
  );
}
