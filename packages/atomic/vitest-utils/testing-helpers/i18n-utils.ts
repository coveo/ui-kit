import i18next, {type i18n as I18n} from 'i18next';
import enTranslations from '@/dist/atomic/lang/en.json';

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
