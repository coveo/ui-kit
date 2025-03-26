import enTranslations from '@/dist/atomic/lang/en.json';
import i18next from 'i18next';

export async function getI18nTestInstance() {
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
