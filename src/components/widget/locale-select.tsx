'use client';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { routing } from '@/i18n/routing';
export function LocaleSelect({ locale }: { locale: string }) {
  const locales = routing.locales;
  const router = useRouter();
  const pathname = usePathname();

  // 현재 경로에서 locale 부분만 교체
  const handleChange = (value: string) => {
    if (value === locale) return;
    // 현재 경로에서 locale prefix만 바꿔서 이동
    const segments = pathname.split('/');
    segments[1] = value; // [ '', 'ko', ... ]
    const newPath = segments.join('/') || '/';
    router.push(newPath);
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((l) => (
          <SelectItem key={l} value={l}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}