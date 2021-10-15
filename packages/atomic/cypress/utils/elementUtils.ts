function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

export function getDeepText(node: Node): string {
  if (node.nodeType === 3) {
    // text node
    return node.textContent ?? '';
  }
  if (isElement(node) && node.shadowRoot !== null) {
    return getDeepText(node.shadowRoot);
  }
  if (node.childNodes) {
    return Array.from(node.childNodes)
      .map((node) => getDeepText(node))
      .filter((text) => text)
      .join(' ');
  }
  return '';
}
