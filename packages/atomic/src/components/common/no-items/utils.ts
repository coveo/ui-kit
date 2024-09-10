import {i18n} from 'i18next';

export const getSummary = (
  i18n: i18n,
  query: string,
  hasResults: boolean,
  label: 'no-products' | 'no-results'
) => {
  if (hasResults) {
    return '';
  }

  return query
    ? i18n.t(`${label}-for`, {
        interpolation: {escapeValue: false},
        query,
      })
    : i18n.t(label);
};
