import {getResourceUrl} from './resource-url';

export function randomID(prepend?: string, length = 5) {
  const randomStr = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  if (!prepend) {
    return randomStr;
  }
  return prepend + randomStr;
}

export async function defer() {
  return new Promise<void>((resolve) => setTimeout(resolve, 10));
}

/**
 * Returns a function that can be executed only once
 */
export function once<T extends unknown[]>(fn: (...args: T) => unknown) {
  let result: unknown;
  return function (this: unknown, ...args: T) {
    if (fn) {
      result = fn.apply(this, args);
      fn = () => {};
    }
    return result;
  };
}

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

export function aggregate<V, K extends PropertyKey>(
  values: readonly V[],
  getKey: (value: V, index: number) => K
): Record<K, V[] | undefined> {
  return values.reduce(
    (aggregatedValues, value, i) => {
      const key = getKey(value, i);
      if (!(key in aggregatedValues)) {
        aggregatedValues[key] = [];
      }
      aggregatedValues[key]!.push(value);
      return aggregatedValues;
    },
    <Record<K, V[] | undefined>>{}
  );
}
