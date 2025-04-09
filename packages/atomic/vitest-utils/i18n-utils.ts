import enTranslations from '@/dist/atomic/lang/en.json';
import i18next, {i18n as I18n} from 'i18next';

export async function createTestI18n(): Promise<I18n> {
  const i18n = i18next.createInstance();
  await i18n.init({
    lng: 'en',
    resources: {
      en: {
        translation: enTranslations,
      },
    },
  });
  return i18n;
}
