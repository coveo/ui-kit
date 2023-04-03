import {i18n} from 'i18next';

function getFieldCaptionNamespace<T extends string>(field: T) {
  return `caption-${field}` as const;
}

export function getFieldCaptions(field: string, i18n: i18n) {
  return (
    i18n.getResourceBundle(i18n.language, getFieldCaptionNamespace(field)) || {}
  );
}

export function getFieldValueCaption(
  field: string,
  facetValue: string,
  i18n: i18n
) {
  const ns = getFieldCaptionNamespace(field);
  return i18n.t(facetValue, {
    ns,
  });
}
