import dayjs from 'dayjs';

const locales: Record<string, () => Promise<unknown>> = {
  en: () => import('dayjs/locale/en'),
  fr: () => import('dayjs/locale/fr'),
  cs: () => import('dayjs/locale/cs'),
  da: () => import('dayjs/locale/da'),
  de: () => import('dayjs/locale/de'),
  el: () => import('dayjs/locale/el'),
  es: () => import('dayjs/locale/es'),
  fi: () => import('dayjs/locale/fi'),
  hu: () => import('dayjs/locale/hu'),
  id: () => import('dayjs/locale/id'),
  it: () => import('dayjs/locale/it'),
  ja: () => import('dayjs/locale/ja'),
  ko: () => import('dayjs/locale/ko'),
  nl: () => import('dayjs/locale/nl'),
  pl: () => import('dayjs/locale/pl'),
  'pt-br': () => import('dayjs/locale/pt-br'),
  ru: () => import('dayjs/locale/ru'),
  sv: () => import('dayjs/locale/sv'),
  th: () => import('dayjs/locale/th'),
  tr: () => import('dayjs/locale/tr'),
  'zh-cn': () => import('dayjs/locale/zh-cn'),
  'zh-tw': () => import('dayjs/locale/zh-tw'),
};

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
