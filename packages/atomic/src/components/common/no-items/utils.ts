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

  const labelFor = `${label}-for`;

  return query
    ? i18n.t(labelFor, {
        interpolation: {escapeValue: false},
        query,
      })
    : i18n.t(label);
};
