import type {i18n} from 'i18next';

function getFieldCaptionNamespace(field: string) {
  return `caption-${field}`;
}

export function getFieldCaptions(field: string, i18n: i18n) {
  const namespace = getFieldCaptionNamespace(field);

  return (i18n.languages ?? []).reduceRight<Record<string, string>>(
    (captions, language) => ({...captions, ...i18n.getResourceBundle(language, namespace)}),
    {}
  );
}

export function getFieldValueCaption(field: string, facetValue: string, i18n: i18n) {
  return i18n.t(facetValue, {
    ns: getFieldCaptionNamespace(field),
  });
}
