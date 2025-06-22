import { useEffect, useState } from 'react';
import defaultTheme from 'tailwindcss/defaultTheme';

const mdBreakpoint = parseInt(defaultTheme.screens.md, 10);

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < mdBreakpoint);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
} 