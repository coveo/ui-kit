const cdnURLs = [
  'https://staticdev.cloud.coveo.com',
  'https://staticstg.cloud.coveo.com',
  'https://static.cloud.coveo.com',
];

// When testing with the CDN build locally (on in the CI), we need add the localhost URL to the list of CDN URLs
if (process?.env?.CDN_LOCAL) {
  cdnURLs.push('http://localhost:3000');
}

function isCoveoCDN() {
  return cdnURLs.includes(new URL(import.meta.url).origin);
}

function getCoveoCdnResourceUrl() {
  return import.meta.resolve('./');
}

export const getResourceUrl = () =>
  isCoveoCDN() ? getCoveoCdnResourceUrl() : undefined;
