const cdnURLs = [
  'https://staticdev.cloud.coveo.com',
  'https://staticstg.cloud.coveo.com',
  'https://static.cloud.coveo.com',
];

function isCoveoCDN() {
  return cdnURLs.includes(new URL(import.meta.url).origin);
}

function getCoveoCdnResourceUrl() {
  return import.meta.resolve('../../');
}

export const getResourceUrl = () =>
  isCoveoCDN() ? getCoveoCdnResourceUrl() : undefined;
