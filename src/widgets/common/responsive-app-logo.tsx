// src/components/ResponsiveAppLogo.tsx
'use client';
import { useEffect, useState } from 'react';
import { Link } from '@/shared/lib/i18n/navigation';

export function ResponsiveAppLogo() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShow(window.innerWidth >= 768); // md 이상에서만 보이게
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return show ? (
    <Link href="/" className="font-semibold">
      koo logo
    </Link>
  ) : null;
}
