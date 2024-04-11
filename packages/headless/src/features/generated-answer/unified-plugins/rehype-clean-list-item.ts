import {visit, SKIP} from 'unist-util-visit';
import {Node, asText, asElement} from './rehype-plugin-utilities';

export const rehypeCleanListItem = () => {
  return (tree: Node) => {
    visit(tree, '', (node: Node, index, parent: Node) => {
      const alteredNode =
        removeEmptyTextNodeFromLiElement(node, index, parent) ||
        removePElementFromLiElement(node, index, parent);

      return alteredNode ? [SKIP, index] : null;
    });
  };
};

export const removeEmptyTextNodeFromLiElement = (
  node: Node,
  index: number,
  parent: Node
) => {
  const text = asText(node);
  const listItem = asElement(parent, 'li');

  if (!!listItem && text?.value === '\n') {
    // Let's remove this empty node as it impacts the rendering of list items
    listItem.children.splice(index, 1);
    return true;
  }
  return false;
};

export const removePElementFromLiElement = (
  node: Node,
  index: number,
  parent: Node
) => {
  const paragraph = asElement(node, 'p');
  const listItem = asElement(parent, 'li');

  if (!!paragraph && !!listItem) {
    // Let's move the paragraph content straight into the parent list item
    parent.children.splice(index, 1, ...node.children);
    return true;
  }

  return false;
};
