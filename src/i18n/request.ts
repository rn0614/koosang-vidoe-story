import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

// messages import (정적 import)
import ko_main_menu from './messages/ko/main-menu.json';
import en_main_menu from './messages/en/main-menu.json';
import ko_note from './messages/ko/note-edit.json';
import en_note from './messages/en/note-edit.json';

// messages 객체로 통합
const messages: Record<string, Record<string, any>> = {
  ko: {
    main_menu: ko_main_menu,
    note: ko_note,
  },
  en: {
    main_menu: en_main_menu,
    note: en_note,
  },
};

export default getRequestConfig(async (param) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await param.requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

    console.log(requested,'requested')
    console.log(routing.locales,'routing.locales')
    console.log(locale,'locale')
  return {
    locale,
    messages: messages[locale] || messages[routing.defaultLocale],
  };
});