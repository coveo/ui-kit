import {getResourceUrl} from './resource-url';

export {
  aggregate,
  camelToKebab,
  kebabToCamel,
  snakeToCamel,
  titleToKebab,
  randomID,
  getRandomArbitrary,
  parseXML,
  parseHTML,
  closest,
  containsVisualElement,
  defer,
  getParent,
  elementHasAncestorTag,
  getFocusedElement,
  isAncestorOf,
  isFocusingOut,
  isInDocument,
  isPropValuesEqual,
  once,
  sanitizeStyle,
  sortByDocumentPosition,
  spreadProperties,
} from './stencil-utils';

export function isElementNode(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

export function isTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE;
}

export function isVisualNode(node: Node) {
  if (isElementNode(node)) {
    return !(node instanceof HTMLStyleElement);
  }
  if (isTextNode(node)) {
    return !!node.textContent?.trim();
  }
  return false;
}

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

export function parseAssetURL(url: string, assetPath = './assets') {
  const [, protocol, remainder] =
    url.match(/^([a-z]+):\/\/(.*?)(\.svg)?$/) || [];
  if (!protocol) {
    if (url.startsWith('./') || url.startsWith('../')) {
      return url;
    }
    return null;
  }
  if (protocol === 'http' || protocol === 'https') {
    return url;
  }
  if (protocol === 'assets') {
    return getAssetPath(`${assetPath}/${remainder}.svg`);
  }
  return null;
}
