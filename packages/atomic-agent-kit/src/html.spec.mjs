import {describe, expect, it} from 'vitest';
import {lineOf, parseHtml, walk} from './html.mjs';

const tags = (nodes) => nodes.map((node) => node.tag);

describe('html', () => {
  describe('#parseHtml', () => {
    it('should parse nested elements with every attribute form', () => {
      const [outer] = parseHtml(`<atomic-a x="1" y='2' z=3 w><atomic-b></atomic-b></atomic-a>`);
      expect(outer.tag).toBe('atomic-a');
      expect(outer.attributes).toEqual([
        {name: 'x', value: '1'},
        {name: 'y', value: '2'},
        {name: 'z', value: '3'},
        {name: 'w', value: null},
      ]);
      expect(tags(outer.children)).toEqual(['atomic-b']);
      expect(outer.children[0].parent).toBe(outer);
      expect(outer.parent).toBeNull();
    });

    it('should skip comments and the text of script and style elements', () => {
      const nodes = parseHtml(
        `<!-- <atomic-a></atomic-a> --><script>const s = '<atomic-b>';</script><atomic-c></atomic-c>`
      );
      expect(tags(walk(nodes))).toEqual(['script', 'atomic-c']);
    });

    it('should tolerate unclosed elements and stray closing tags', () => {
      const nodes = parseHtml('<atomic-a><atomic-b></atomic-c></atomic-a><atomic-d>');
      expect(tags(nodes)).toEqual(['atomic-a', 'atomic-d']);
      expect(tags(nodes[0].children)).toEqual(['atomic-b']);
    });

    it('should keep a self-closed element open, as HTML does, and mark it', () => {
      const [first] = parseHtml('<atomic-a /><atomic-b></atomic-b>');
      expect(first.selfClosing).toBe(true);
      expect(tags(first.children)).toEqual(['atomic-b']);
    });

    it('should not nest the elements that follow a void element', () => {
      expect(tags(parseHtml('<img src="x.png"><atomic-a></atomic-a>'))).toEqual([
        'img',
        'atomic-a',
      ]);
    });

    it('should tell an empty element from one holding text or a comment', () => {
      const [empty, withText, withComment] = parseHtml(
        '<template>  </template><p>x</p><template><!-- ... --></template>'
      );
      expect(empty.empty).toBe(true);
      expect(withText.empty).toBe(false);
      expect(withComment.empty).toBe(false);
    });

    it('should lowercase tag and attribute names', () => {
      const [node] = parseHtml('<Atomic-A Field="x"></Atomic-A>');
      expect(node.tag).toBe('atomic-a');
      expect(node.attributes[0].name).toBe('field');
    });

    it('should record the line of each start tag', () => {
      const nodes = parseHtml('<atomic-a>\n  <atomic-b\n    x="1"></atomic-b>\n</atomic-a>');
      expect(walk(nodes).map((node) => node.line)).toEqual([1, 2]);
    });
  });

  describe('#walk', () => {
    it('should list the elements depth first', () => {
      const nodes = parseHtml('<a><b><c></c></b><d></d></a><e></e>');
      expect(tags(walk(nodes))).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('#lineOf', () => {
    it('should count lines up to an index', () => {
      expect(lineOf('one\ntwo\nthree', 0)).toBe(1);
      expect(lineOf('one\ntwo\nthree', 9)).toBe(3);
    });
  });
});
