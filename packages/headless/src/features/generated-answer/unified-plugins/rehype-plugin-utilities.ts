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
  properties?: {
    ariaLabel?: String;
    className?: String[];
  };
}

export const asText = (node: Node): TextNode | undefined => {
  return node.type === 'text' ? (node as TextNode) : undefined;
};

export const asElement = (
  node: Node,
  tagName: string
): ElementNode | undefined => {
  if (node?.type !== 'element') {
    return undefined;
  }

  const element = node as ElementNode;
  return element.tagName === tagName ? element : undefined;
};

export const asElementMatching = (
  node: Node,
  tagPattern: RegExp
): ElementNode | undefined => {
  if (node?.type !== 'element') {
    return undefined;
  }

  const element = node as ElementNode;
  return tagPattern.test(element.tagName) ? element : undefined;
};

export const getTextContent = (node: Node): string => {
  const text = asText(node);
  if (text) {
    return text.value;
  }

  return node.children
    .map((child) => getTextContent(child))
    .filter((content) => !!content)
    .join(' ');
};
