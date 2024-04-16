import {visit, SKIP} from 'unist-util-visit';
import {ElementNode, Node, asElement} from './rehype-plugin-utilities';

const CONTAINER_CLASS = 'scrollable-table';

const isScrollableContainer = (n: Node) => {
  const container = asElement(n, 'div');

  return (
    container && container.properties?.className?.includes(CONTAINER_CLASS)
  );
};

export function rehypeScrollableTable() {
  return (tree: Node) => {
    visit(tree, 'element', (node: Node, index, parent: Node) => {
      console.log(node);

      return wrapTableElementInScrollingContainer(node, index, parent)
        ? [SKIP, index]
        : null;
    });
  };
}

export const wrapTableElementInScrollingContainer = (
  node: Node,
  index: number,
  parent: Node
): boolean => {
  const table = asElement(node, 'table');
  if (table && !isScrollableContainer(parent)) {
    // Let's wrap the table element into a div so it becomes scrollable
    parent.children.splice(index, 1, {
      type: 'element',
      tagName: 'div',
      properties: {
        className: [CONTAINER_CLASS],
      },
      children: [node],
    } as ElementNode);

    return true;
  }

  return false;
};
