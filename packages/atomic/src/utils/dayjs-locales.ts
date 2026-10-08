import dayjs from 'dayjs';
import {locales} from '../generated/dayjs-locales-data';

const warn = (language: string) => console.warn(`Cannot load dayjs locale file for "${language}"`);

const getCandidateLocales = (languageInput: string) => {
  try {
    const {language, script, region} = new Intl.Locale(languageInput);
    return [
      languageInput,
      ...(region ? [`${language}-${region}`] : []),
      ...(script ? [`${language}-${script}`] : []),
      language,
    ];
  } catch {
    return [languageInput, languageInput.split('-')[0]];
  }
};

const resolveLanguage = (languageInput: string) =>
  getCandidateLocales(languageInput)
    .map((locale) => locale.toLowerCase())
    .find((locale) => Object.hasOwn(locales, locale)) ?? languageInput;

export async function loadDayjsLocale(languageInput: string) {
  const language = resolveLanguage(languageInput);
  if (!locales[language]) {
    warn(language);
    return;
  }

  try {
    await locales[language]();
    dayjs.locale(language);
  } catch {
    warn(language);
  }
}
