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
