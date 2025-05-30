import {getResourceUrl} from './stencil-resource-url';

export function getAssetPath(path: string): string {
  const resourceUrl = getResourceUrl();
  const baseUrl =
    resourceUrl !== undefined
      ? new URL('./', resourceUrl).href
      : new URL('./', window.document.baseURI).href;
  const assetUrl = new URL(path, baseUrl);

  return assetUrl.origin !== window.location.origin
    ? assetUrl.href
    : assetUrl.pathname;
}
