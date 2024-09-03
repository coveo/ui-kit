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
