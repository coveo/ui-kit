import type {i18n} from 'i18next';

export const getAllCategoriesLocalizedLabel = ({
  facetId,
  field,
  i18n,
}: {
  facetId?: string;
  field: string;
  i18n: i18n;
}) => {
  if (facetId && i18n.exists(`all-categories-${facetId}`)) {
    return i18n.t(`all-categories-${facetId}`);
  }
  if (i18n.exists(`all-categories-${field}`)) {
    return i18n.t(`all-categories-${field}`);
  }
  return i18n.t('all-categories');
};
