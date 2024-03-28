import {visit, SKIP} from 'unist-util-visit';

export function rehypeCleanListItem() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'text', (node: any, index, parent) => {
      if (
        parent.type === 'element' &&
        parent.tagName === 'li' &&
        node.value === '\n'
      ) {
        // Let's remove this empty node as it impacts the rendering of list items
        parent.children.splice(index, 1);
        return [SKIP, index];
      }

      return;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'element', (node: any, index, parent) => {
      if (
        node.tagName === 'p' &&
        parent.type === 'element' &&
        parent.tagName === 'li'
      ) {
        // Let's move the paragraph content straight into the parent list item

        parent.children.splice(index, 1, ...node.children);
        return [SKIP, index];
      }

      return;
    });
  };
}
