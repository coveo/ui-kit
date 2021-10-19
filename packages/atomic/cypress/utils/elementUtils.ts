function isElement(node: Node): node is Element {
  return node.nodeType === 1;
}

function isTextNode(node: Node): node is Text {
  return node.nodeType === 3;
}

export function getDeepText(node: Node): string {
  if (isTextNode(node)) {
    return node.wholeText;
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
