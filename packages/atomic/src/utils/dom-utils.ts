import DOMPurify from 'dompurify';

export function rectEquals(r1: DOMRect, r2: DOMRect) {
  return (
    r1.x === r2.x &&
    r1.y === r2.y &&
    r1.width === r2.width &&
    r1.height === r2.height
  );
}

export function parentNodeToString(node: ParentNode): string {
  return Array.from(node.children)
    .map((child) => child.outerHTML)
    .join('');
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

export function parseHTML(string: string) {
  return new window.DOMParser().parseFromString(string, 'text/html');
}

export function parseXML(string: string) {
  return new window.DOMParser().parseFromString(string, 'text/xml');
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

export function containsVisualElement(node: Node) {
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes.item(i);
    if (isVisualNode(child)) {
      return true;
    }
  }
  return false;
}

export function elementHasAncestorTag(
  el: HTMLElement,
  tagName: string
): boolean {
  const parentElement = el.parentElement;
  if (!parentElement) {
    return false;
  }
  if (parentElement.tagName === tagName.toUpperCase()) {
    return true;
  }
  return elementHasAncestorTag(parentElement, tagName);
}

export function sanitizeStyle(style: string) {
  const purifiedOuterHTML = DOMPurify.sanitize(`<style>${style}</style>`, {
    ALLOWED_TAGS: ['style'],
    ALLOWED_ATTR: [],
    FORCE_BODY: true,
  });
  const wrapperEl = document.createElement('div');
  // deepcode ignore ReactSetInnerHtml: sanitized by dompurify
  wrapperEl.innerHTML = purifiedOuterHTML;
  return wrapperEl.querySelector('style')?.innerHTML;
}

export function getFocusedElement(
  rootElement: Document | ShadowRoot = document
): Element | null {
  const activeElement = rootElement.activeElement;
  if (activeElement?.shadowRoot) {
    return getFocusedElement(activeElement.shadowRoot) ?? activeElement;
  }
  return activeElement;
}

export function isFocusingOut(event: FocusEvent) {
  return (
    document.hasFocus() &&
    (!(event.relatedTarget instanceof Node) ||
      (event.currentTarget instanceof Node &&
        !event.currentTarget.contains(event.relatedTarget)))
  );
}

// https://terodox.tech/how-to-tell-if-an-element-is-in-the-dom-including-the-shadow-dom/
export function isInDocument(element: Node) {
  let currentElement = element;
  while (currentElement?.parentNode) {
    if (currentElement.parentNode === document) {
      return true;
    } else if (currentElement.parentNode instanceof ShadowRoot) {
      currentElement = currentElement.parentNode.host;
    } else {
      currentElement = currentElement.parentNode;
    }
  }
  return false;
}

export function getParent(element: Element | ShadowRoot) {
  if (element.parentNode) {
    return element.parentNode as Element | ShadowRoot;
  }
  if (element instanceof ShadowRoot) {
    return element.host;
  }
  return null;
}

export function isAncestorOf(
  ancestor: Element | ShadowRoot,
  element: Element | ShadowRoot
): boolean {
  if (element === ancestor) {
    return true;
  }
  if (
    element instanceof HTMLElement &&
    element.assignedSlot &&
    isAncestorOf(ancestor, element.assignedSlot)
  ) {
    return true;
  }
  const parent = getParent(element);
  return parent === null ? false : isAncestorOf(ancestor, parent);
}

export const sortByDocumentPosition = (a: Node, b: Node): 1 | -1 =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
