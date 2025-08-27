import { DrawerTrigger } from '@/shared/ui/drawer';
import { Button } from '@/shared/ui/button';
import { Link } from '@/shared/lib/i18n/navigation';
import Image from 'next/image';

export default function HeaderMenuButton({ platform }: { platform: string }) {
  if (platform === 'webview') {
    return <div className="p-2"></div>;
  }
  return (
    <>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" aria-label="메뉴 열기">
          <span className="text-2xl">☰</span>
        </Button>
      </DrawerTrigger>
      <Link href="/" className="font-semibold flex items-center">
        <Image
          src="/image/kooLogo.png"
          alt="Koo Logo"
          width={50}
          height={10}
          style={{
            paddingTop: '10px',
            objectFit: 'contain',
          }}
        />
      </Link>
    </>
  );
}
