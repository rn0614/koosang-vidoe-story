import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async (param) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await param.requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`@/shared/constants/messages/${locale}.json`)).default
  };
});