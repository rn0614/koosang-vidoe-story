import { DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

export default function HeaderMenuButton({ platform }: { platform: string }) {
  if (platform === 'webview') {
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