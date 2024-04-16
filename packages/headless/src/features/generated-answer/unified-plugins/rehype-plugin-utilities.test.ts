import {
  ElementNode,
  TextNode,
  Node,
  getTextContent,
} from './rehype-plugin-utilities';

describe('rehype-plugin-utilities', () => {
  const emptyText: TextNode = {
    type: 'text',
    value: '',
    children: [],
  };

  const emptyParagraph: ElementNode = {
    type: 'element',
    tagName: 'p',
    children: [],
  };

  describe('getTextContext', () => {
    it('should return the value of a text node', () => {
      const text = {...emptyText, value: 'some content'};

      const result = getTextContent(text);

      expect(result).toBe('some content');
    });

    it('should concatenate multiple text nodes', () => {
      const paragraph = {
        ...emptyParagraph,
        children: [
          {...emptyText, value: 'one'},
          {...emptyText, value: 'two'},
          {...emptyText, value: 'three'},
        ],
      };

      const result = getTextContent(paragraph);

      expect(result).toBe('one two three');
    });

    it('should traverse elements and concatenate text nodes', () => {
      const root: Node = {
        type: 'root',
        children: [
          {
            ...emptyParagraph,
            children: [{...emptyText, value: 'one'} as TextNode],
          },
          {
            ...emptyParagraph,
            children: [{...emptyText, value: 'two'} as TextNode],
          },
          {
            ...emptyParagraph,
            children: [{...emptyText, value: 'three'} as TextNode],
          },
        ],
      };

      const result = getTextContent(root);

      expect(result).toBe('one two three');
    });
  });
});
