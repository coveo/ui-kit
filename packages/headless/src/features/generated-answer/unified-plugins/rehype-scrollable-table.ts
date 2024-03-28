import {visit, SKIP} from 'unist-util-visit';

export function rehypeScrollableTable() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, 'element', (node: any, index, parent) => {
      console.log(node);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isScrollableContainer = (element: any) => {
        return (
          element.type === 'element' &&
          element.tagName === 'div' &&
          element.properties.className?.includes('scrollable-table')
        );
      };

      if (node.tagName === 'table' && !isScrollableContainer(parent)) {
        // Let's wrap the table element into a div so it becomes scrollable
        parent.children.splice(index, 1, {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['scrollable-table'],
          },
          children: [node],
        });

        return [SKIP, index];
      }

      return;
    });
  };
}
