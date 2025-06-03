'use client';
import { usePathname } from 'next/navigation';
import { DrawerTrigger } from './ui/drawer';
import { Button } from '@/components/ui/button';

export default function HeaderMenuButton({ platform }: { platform: string }) {
  const pathname = usePathname();
  const isRagDetail = /^\/[a-z]{2}\/rag\/[^/]+/.test(pathname);

  if (platform === 'webview' && isRagDetail) {
    return <div className="p-2"></div>;
  }
  return (
    <DrawerTrigger asChild>
      <Button variant="outline" size="icon" aria-label="메뉴 열기">
        <span className="text-2xl">☰</span>
      </Button>
    </DrawerTrigger>
  );
} 