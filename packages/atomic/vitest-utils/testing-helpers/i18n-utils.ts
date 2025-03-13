import i18next, {i18n as I18n} from 'i18next';

export async function createTestI18n(): Promise<I18n> {
  const i18n = i18next.createInstance();
  await i18n.init({
    lng: 'en',
    resources: {
      en: {
        translation: {},
      },
    },
  });
  return i18n;
}
