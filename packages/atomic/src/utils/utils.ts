import {getAssetPath} from '@stencil/core';
import {NODE_TYPES} from '@stencil/core/mock-doc';
import {sanitize} from 'dompurify';

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

export function listenOnce<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): void;
export function listenOnce(
  element: HTMLElement,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void;
export function listenOnce(
  element: HTMLElement,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void {
  const _listener: EventListener = (evt: Event) => {
    element.removeEventListener(type, _listener, options);
    typeof listener === 'object'
      ? listener.handleEvent.call(element, evt)
      : listener.call(element, evt);
  };
  element.addEventListener(type, _listener, options);
}

export function camelToKebab(value: string) {
  return value.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function kebabToCamel(value: string) {
  return value.replace(/-./g, (x) => x[1].toUpperCase());
}

export function snakeToCamel(value: string) {
  return value
    .toLowerCase()
    .replace(/([_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));
}

export function titleToKebab(value: string) {
  return value.replace(/\s/g, '-').toLowerCase();
}

export function randomID(prepend?: string, length = 5) {
  const randomStr = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  if (!prepend) {
    return randomStr;
  }
  return prepend + randomStr;
}

export function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function parseXML(string: string) {
  return new window.DOMParser().parseFromString(string, 'text/xml');
}

export function parseHTML(string: string) {
  return new window.DOMParser().parseFromString(string, 'text/html');
}

export function containsVisualElement(node: Node) {
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes.item(i);
    if (
      child.nodeType === NODE_TYPES.ELEMENT_NODE ||
      (child.nodeType === NODE_TYPES.TEXT_NODE && child.textContent?.trim())
    ) {
      return true;
    }
  }
  return false;
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

// TODO: add tests
export function elementHasAncestorTag(
  el: HTMLElement,
  tagName: string
): boolean {
  const parentElement = el.parentElement;
  if (!parentElement) return false;
  if (parentElement.tagName === tagName.toUpperCase()) return true;
  return elementHasAncestorTag(parentElement, tagName);
}

export function closest<K extends keyof HTMLElementTagNameMap>(
  element: Element | null,
  selector: K
): HTMLElementTagNameMap[K] | null;
export function closest<K extends keyof SVGElementTagNameMap>(
  element: Element | null,
  selector: K
): SVGElementTagNameMap[K] | null;
export function closest<E extends Element = Element>(
  element: Element | null,
  selector: string
): E | null;
export function closest(
  element: Element | null,
  selector: string
): HTMLElement | null {
  if (!element) {
    return null;
  }
  if (element.matches(selector)) {
    return element as HTMLElement;
  }
  if (element.parentNode instanceof ShadowRoot) {
    return closest(element.parentNode.host, selector);
  }
  return closest(element.parentElement, selector);
}

export function sanitizeStyle(style: string) {
  const purifiedOuterHTML = sanitize(`<style>${style}</style>`, {
    ALLOWED_TAGS: ['style'],
    ALLOWED_ATTR: [],
    FORCE_BODY: true,
  });
  const wrapperEl = document.createElement('div');
  // deepcode ignore ReactSetInnerHtml: sanitized by dompurify
  wrapperEl.innerHTML = purifiedOuterHTML;
  return wrapperEl.querySelector('style')?.innerHTML;
}
