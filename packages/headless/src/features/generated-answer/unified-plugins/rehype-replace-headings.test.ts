import {ElementNode, TextNode} from './rehype-plugin-utilities';
import {replaceHxElement} from './rehype-replace-headings';

describe('rehype-replace-headings', () => {
  describe('replaceHxElement', () => {
    [1, 2, 3, 4, 5, 6]
      .map((level) => ({tag: `h${level}`, level}))
      .forEach((testCase) => {
        it(`should replace ${testCase.tag} element`, () => {
          const text = {
            type: 'text',
            value: 'the header content',
          } as TextNode;
          const node = {
            type: 'element',
            tagName: testCase.tag,
            children: [text],
          } as ElementNode;
          const container = {
            type: 'element',
            tagName: 'div',
            children: [node],
          } as ElementNode;

          const skipNode = replaceHxElement(node, 0, container);

          expect(skipNode).toBe(true);
          expect(container.children).toStrictEqual([
            {
              type: 'element',
              tagName: 'div',
              properties: {
                className: [`heading-${testCase.level}`],
                ariaLabel: 'the header content',
              },
              children: [text],
            } as ElementNode,
          ]);
        });
      });

    it('should not replace other elements', () => {
      const text = {
        type: 'text',
        value: 'some paragraph content',
      } as TextNode;
      const node = {
        type: 'element',
        tagName: 'p',
        children: [text],
      } as ElementNode;
      const container = {
        type: 'element',
        tagName: 'div',
        children: [node],
      } as ElementNode;

      const skipNode = replaceHxElement(node, 0, container);

      expect(skipNode).toBe(false);
    });
  });
});
