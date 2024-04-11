export interface Node {
  type: 'root' | 'element' | 'text';
  children: Node[];
}

export interface TextNode extends Node {
  type: 'text';
  value: string;
}

export interface ElementNode extends Node {
  type: 'element';
  tagName: string;
}

export const asText = (node: Node): TextNode | undefined => {
  return node.type === 'text' ? (node as TextNode) : undefined;
};

export const asElement = (
  node: Node,
  tagName: string
): ElementNode | undefined => {
  if (node.type !== 'element') {
    return undefined;
  }

  const element = node as ElementNode;
  return element.tagName === tagName ? element : undefined;
};
