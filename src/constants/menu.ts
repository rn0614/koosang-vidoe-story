import type { MenuItem } from '@/types/menu';

export const MAIN_MENU: MenuItem[] = [
  { href: '/blog', labelKey: 'blog' },
  { href: '/game', labelKey: 'game' },
  { href: '/note', labelKey: 'note' },
];

export const SIDEBAR_MENU: MenuItem[] = [
  {
    href: '/dashboard',
    labelKey: 'dashboard',
    icon: null,
  },
  {
    href: '/rag',
    labelKey: 'rag',
    icon: null,
  },
  {
    href: '/blog',
    labelKey: 'blog',
    icon: null,
    children: [
      { href: '/blog/100%20Resources', labelKey: 'blogResources' },
      { href: '/blog/test', labelKey: 'blogTest' },
    ],
  },
  {
    href: '/game',
    labelKey: 'game',
    icon: null,
    children: [
      { href: '/game/boardgame', labelKey: 'boardgame' },
      { href: '/game/mincraft', labelKey: 'mincraft' },
    ],
  },
  {
    href: '/note',
    labelKey: 'note',
    icon: null,
  },
];