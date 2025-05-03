'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export function ResponsiveSidebar() {
  return (
    <>
      {/* 모바일: Drawer 트리거(햄버거 버튼) */}
      <div className="fixed left-4 top-4 z-50 block">
          <DrawerContent>
            <div className="mx-auto w-full max-w-xs">
              <DrawerTitle>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="메뉴 열기">
                    <span className="text-2xl">☰</span>
                  </Button>
                </DrawerTrigger>
                <DrawerClose asChild>
                  <Link href="/" className="font-semibold">
                    koo logo
                  </Link>
                </DrawerClose>
              </DrawerTitle>
              <ul className="flex flex-col gap-2 p-4">
                <li>
                  <DrawerClose asChild>
                    <Link
                      href="/"
                      className="block rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      홈
                    </Link>
                  </DrawerClose>
                </li>
                <li>
                  <DrawerClose asChild>
                    <Link
                      href="/note"
                      className="block rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      노트
                    </Link>
                  </DrawerClose>
                </li>
                <li>
                  <DrawerClose asChild>
                    <Link
                      href="/about"
                      className="block rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      소개
                    </Link>
                  </DrawerClose>
                </li>
              </ul>
            </div>
          </DrawerContent>
      </div>

      {/* 데스크톱: 항상 보이는 사이드바 */}
      <nav className="hidden min-h-full w-48 rounded-lg bg-gray-100 p-4 shadow dark:bg-gray-800 md:block">
        <ul className="flex flex-col gap-2">
          <li>
            <Link
              href="/"
              className="block rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              홈
            </Link>
          </li>
          <li>
            <Link
              href="/note"
              className="block rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              노트
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="block rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              소개
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
