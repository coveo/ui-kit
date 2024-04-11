import {
  removeEmptyTextNodeFromLiElement,
  removePElementFromLiElement,
} from './rehype-clean-list-item';
import {ElementNode, TextNode} from './rehype-plugin-utilities';

describe('rehype-clean-list-item', () => {
  const emptyTextNode: TextNode = {
    type: 'text',
    value: '\n',
    children: [],
  };

  const nonEmptyTextNode: TextNode = {
    ...emptyTextNode,
    value: 'some text content',
  };

  const listItemNode: ElementNode = {
    type: 'element',
    tagName: 'li',
    children: [],
  };

  const paragraphNode: ElementNode = {
    type: 'element',
    tagName: 'p',
    children: [],
  };

  describe('removeEmptyTextNodeFromLiElement', () => {
    it('should remove empty text node when present', () => {
      const listItem = {...listItemNode, children: [emptyTextNode]};

      const skipNode = removeEmptyTextNodeFromLiElement(
        emptyTextNode,
        0,
        listItem
      );

      expect(skipNode).toBe(true);
      expect(listItem.children).toStrictEqual([]);
    });

    it('should not remove text node when not empty', () => {
      const listItem = {...listItemNode, children: [nonEmptyTextNode]};

      const skipNode = removeEmptyTextNodeFromLiElement(
        nonEmptyTextNode,
        0,
        listItem
      );

      expect(skipNode).toBe(false);
      expect(listItem.children).toStrictEqual([nonEmptyTextNode]);
    });

    it('should do nothing when the text node parent is not an Li element', () => {
      const paragraph = {...paragraphNode, children: [emptyTextNode]};

      const skipNode = removeEmptyTextNodeFromLiElement(
        emptyTextNode,
        0,
        paragraph
      );

      expect(skipNode).toBe(false);
      expect(paragraph.children).toStrictEqual([emptyTextNode]);
    });
  });

  describe('removePElementFromLiElement', () => {
    it('should remove wrapping paragraph when inside an Li element', () => {
      const paragraph = {...paragraphNode, children: [nonEmptyTextNode]};
      const listItem = {...listItemNode, children: [paragraph]};

      const skipNode = removePElementFromLiElement(paragraph, 0, listItem);

      expect(skipNode).toBe(true);
      expect(listItem.children).toStrictEqual([nonEmptyTextNode]);
    });

    it('should not remove paragraph when inside an other element', () => {
      const level2Paragraph = {...paragraphNode, children: [nonEmptyTextNode]};
      const level1Paragraph = {...paragraphNode, children: [level2Paragraph]};

      const skipNode = removePElementFromLiElement(
        level2Paragraph,
        0,
        level1Paragraph
      );

      expect(skipNode).toBe(false);
    });
  });
});
