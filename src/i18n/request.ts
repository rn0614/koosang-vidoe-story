import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import fs from 'fs';
import path from 'path';

export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messagesDir = path.join(process.cwd(), 'messages', locale);
  const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

  const messages: Record<string, any> = {};

  for (const file of files) {
    const key = file.replace(/\.json$/, '');
    messages[key] = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf-8'));
  }

  return {
    locale,
    messages
  };
});