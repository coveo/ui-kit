import {i18n} from 'i18next';

export const getSummary = (i18n: i18n, query: string, hasResults: boolean) => {
  if (hasResults) {
    return '';
  }

  return query
    ? i18n.t('no-results-for', {
        interpolation: {escapeValue: false},
        query,
      })
    : i18n.t('no-results');
};
