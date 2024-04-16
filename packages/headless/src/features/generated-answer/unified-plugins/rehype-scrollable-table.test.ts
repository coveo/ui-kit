import {ElementNode, Node} from './rehype-plugin-utilities';
import {wrapTableElementInScrollingContainer} from './rehype-scrollable-table';

describe('rehype-scrollable-table', () => {
  describe('wrapTableElementInScrollingContainer', () => {
    const table: ElementNode = {
      type: 'element',
      tagName: 'table',
      children: [],
    };
    const emptyScrollableContainer: ElementNode = {
      type: 'element',
      tagName: 'div',
      properties: {
        className: ['scrollable-table'],
      },
      children: [],
    };
    const emptyRoot: Node = {
      type: 'root',
      children: [],
    };

    it('should wrap a table element in scrolling container', () => {
      const root = {...emptyRoot, children: [table]};

      const skipNode = wrapTableElementInScrollingContainer(table, 0, root);

      expect(skipNode).toBe(true);
      expect(root.children).toStrictEqual([
        {...emptyScrollableContainer, children: [table]},
      ]);
    });

    it('should not wrap a table that is already in a scrolling container', () => {
      const root = {
        ...emptyRoot,
        children: [{...emptyScrollableContainer, children: [table]}],
      };

      const skipNode = wrapTableElementInScrollingContainer(
        table,
        0,
        root.children[0]
      );

      expect(skipNode).toBe(false);
    });

    it('show not wrap other elements', () => {
      const root = {
        ...emptyRoot,
        children: [
          {
            type: 'element',
            tagName: 'p',
            children: [],
          } as ElementNode,
        ],
      };

      const skipNode = wrapTableElementInScrollingContainer(
        root.children[0],
        0,
        root
      );

      expect(skipNode).toBe(false);
    });
  });
});
