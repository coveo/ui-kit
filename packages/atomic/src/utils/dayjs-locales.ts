import dayjs from 'dayjs';
import {locales} from '../generated/dayjs-locales-data';

const warn = (language: string) => console.warn(`Cannot load dayjs locale file for "${language}"`);

const findLocale = (language: string) =>
  Object.keys(locales).find((locale) => locale.toLowerCase() === language.toLowerCase());

const resolveLanguage = (languageInput: string) =>
  findLocale(languageInput) ?? findLocale(languageInput.split('-')[0]) ?? languageInput;

export function loadDayjsLocale(languageInput: string) {
  const language = resolveLanguage(languageInput);
  if (!locales[language]) {
    warn(language);
    return;
  }

  try {
    locales[language]().then(() => dayjs.locale(language));
  } catch (_) {
    warn(language);
  }
}
