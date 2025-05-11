import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

// messages import (정적 import)
import ko_main_menu from './messages/ko/main-menu.json';
import en_main_menu from './messages/en/main-menu.json';
import ko_note_edit from './messages/ko/note-edit.json';
import en_note_edit from './messages/en/note-edit.json';

// messages 객체로 통합
const messages: Record<string, Record<string, any>> = {
  ko: {
    main_menu: ko_main_menu,
    note_edit: ko_note_edit,
  },
  en: {
    main_menu: en_main_menu,
    note_edit: en_note_edit,
  },
};

export default getRequestConfig(async (param) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await param.requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  return {
    locale,
    messages: messages[locale] || messages[routing.defaultLocale],
  };
});