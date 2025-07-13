import type { MenuItem } from '@/shared/types/menu';

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
    clickable: false,
    href: '/rag',
    labelKey: 'blog',
    icon: null,
    children: [
      {
        clickable: true,
        href: '/rag?tags=Front',
        labelKey: 'Frontend',
      },
      {
        clickable: true,
        href: '/rag?tags=Back',
        labelKey: 'Backend',
      },
      {
        clickable: true,
        href: '/rag?tags=CICD',
        labelKey: 'CICD',
      },
      {
        clickable: true,
        href: '/rag/note',
        labelKey: 'note',
      },
    ],
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
    clickable: false,
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
  // 일시적 제한
  // {
  //   clickable: false,
  //   href: '/alarm',
  //   labelKey: 'alarm',
  //   icon: null,
  //   children: [
  //     {
  //       clickable: true,
  //       href: '/alarm/company',
  //       labelKey: 'company',
  //     },
  //     {
  //       clickable: true,
  //       href: '/alarm/customer',
  //       labelKey: 'customer',
  //     },
  //   ],
  // },
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
      {
        clickable: true,
        href: '/workflow/my-workflow',
        labelKey: 'my-workflow',
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
