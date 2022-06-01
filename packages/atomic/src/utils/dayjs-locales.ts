import dayjs from 'dayjs';
import {locales} from '../generated/dayjs-locales-data';

const warn = (language: string) =>
  console.warn(`Cannot load dayjs locale file file for "${language}"`);

export function loadDayjsLocale(language: string) {
  if (!locales[language]) {
    warn(language);
    return;
  }

  try {
    locales[language]().then(() => dayjs.locale(language));
  } catch (error) {
    warn(language);
  }
}
