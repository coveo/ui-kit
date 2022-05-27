import dayjs from 'dayjs';

const warn = (language: string) =>
  console.warn(`Cannot load dayjs locale file file for "${language}"`);

export async function loadDayjsLocale(
  languageAssetPath: string,
  language: string
) {
  try {
    const module = await import(`${languageAssetPath}/dayjs/${language}.js`);
    const locale = module.default;
    dayjs.locale(locale);
  } catch (error) {
    warn(language);
  }
}
