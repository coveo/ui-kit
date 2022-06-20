import {i18n} from 'i18next';

function getFieldCaptionNamespace(field: string) {
  return `caption-${field}`;
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
  const encodedColon = encodeURIComponent(':');

  return i18n
    .t(facetValue.replace(/:/g, encodedColon), {
      ns: getFieldCaptionNamespace(field),
    })
    .replace(new RegExp(encodedColon, 'g'), ':');
}
