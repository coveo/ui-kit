import {SKIP, visit} from 'unist-util-visit';
import {
  asElementMatching,
  ElementNode,
  getTextContent,
  Node,
} from './rehype-plugin-utilities';

const tagPattern = /^h(?<level>[123456])$/i;

const extractLevelFromTagName = (tagName: string): number => {
  const match = tagPattern.exec(tagName);
  return Number(match?.groups?.['level']);
};

export const rehypeReplaceHeadings = () => {
  return (tree: Node) => {
    visit(tree, 'element', (node: Node, index, parent: Node) => {
      replaceHxElement(node, index, parent) ? [SKIP, index] : null;
    });
  };
};

export const replaceHxElement = (
  node: Node,
  index: number,
  parent: Node
): boolean => {
  const header = asElementMatching(node, tagPattern);

  if (header) {
    const level = extractLevelFromTagName(header.tagName);

    // Substitute the heading element with a div element with a level attribute.
    parent.children.splice(index, 1, {
      type: 'element',
      tagName: 'div',
      properties: {
        className: [`heading-${level}`],
        ariaLabel: getTextContent(header),
      },
      children: header.children,
    } as ElementNode);

    return true;
  }

  return false;
};
