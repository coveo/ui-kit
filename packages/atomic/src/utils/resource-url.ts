const cdnURLs = [
  'https://staticdev.cloud.coveo.com',
  'https://staticstg.cloud.coveo.com',
  'https://static.cloud.coveo.com',
];

function isCoveoCDN(url: URL) {
  return cdnURLs.includes(url.origin);
}

function getCoveoCdnResourceUrl(moduleUrl: URL) {
  return new URL(
    moduleUrl.pathname!.split('/').slice(1, 3).join('/'),
    moduleUrl.origin
  ).href;
}

export const getResourceUrl = () => {
  const moduleUrl = new URL(import.meta.url);
  return isCoveoCDN(moduleUrl) ? getCoveoCdnResourceUrl(moduleUrl) : moduleUrl;
};
