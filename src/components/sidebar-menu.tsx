import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { MenuItem } from '@/types/menu';
import { DrawerClose } from './ui/drawer';

export function SidebarMenu({ menu }: { menu: MenuItem[] }) {
  const t = useTranslations('main_menu');
  return (
    <ul className="flex flex-col gap-2 p-4">
      {menu.map((item) => (
        <li key={item.href}>
          <DrawerClose asChild>
            <Link
              href={item.href}
              className="block rounded px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {item.icon}
              {t(item.labelKey)}
            </Link>
          </DrawerClose>
          {item.children && item.children.length > 0 && (
            <SidebarMenu menu={item.children} />
          )}
        </li>
      ))}
    </ul>
  );
}
