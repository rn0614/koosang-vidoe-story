import type { MenuItem } from '@/types/menu';

export const MAIN_MENU: MenuItem[] = [
  { href: '/rag', labelKey: 'rag' },
  { href: '/alarm', labelKey: 'alarm' },
  { href: '/game', labelKey: 'game' },
  { href: '/note', labelKey: 'note' },
];

export const SIDEBAR_MENU: MenuItem[] = [
  /* 메인 dashboard로 리다이렉스토 메뉴 삭제
  {
    href: '/dashboard',
    labelKey: 'dashboard',
    icon: null,
  },*/
  {
    clickable: true,
    href: '/rag',
    labelKey: 'rag',
    icon: null,
  },
  /*{
    href: '/blog',
    labelKey: 'blog',
    icon: null,
    children: [
      { href: '/blog/100%20Resources', labelKey: 'blogResources' },
      { href: '/blog/test', labelKey: 'blogTest' },
    ],
  },*/
  {
    clickable: true,
    href: '/game',
    labelKey: 'game',
    icon: null,
    children: [
      {
        clickable: true,
        href: '/game/boardgame',
        labelKey: 'boardgame',
      },
      // { href: '/game/mincraft', labelKey: 'mincraft' },
    ],
  },
  {
    clickable: true,
    href: '/note',
    labelKey: 'note',
    icon: null,
  },
  {
    clickable: false,
    href: '/alarm',
    labelKey: 'alarm',
    icon: null,
    children: [
      {
        clickable: true,
        href: '/alarm/company',
        labelKey: 'company',
      },
      {
        clickable: true,
        href: '/alarm/customer',
        labelKey: 'customer',
      },
    ],
  },
  {
    clickable: false,
    href: '/workflow',
    labelKey: 'workflow',
    icon: null,
    children: [
      {
        clickable: true,
        href: '/workflow/template',
        labelKey: 'template',
      },
    ],
  },
  {
    clickable: true,
    href: '/container',
    labelKey: 'container',
    icon: null,
  },
];
