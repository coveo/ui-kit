import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  closest,
  containsVisualElement,
  elementHasAncestorTag,
  getFocusedElement,
  getParent,
  isAncestorOf,
  isElementNode,
  isFocusingOut,
  isInDocument,
  isTextNode,
  isVisualNode,
  parentNodeToString,
  parseHTML,
  parseXML,
  rectEquals,
  sanitizeStyle,
  sortByDocumentPosition,
} from './dom-utils';

describe('dom-utils', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('#rectEquals', () => {
    it('should return true for identical rectangles', () => {
      const rect1 = new DOMRect(10, 20, 100, 200);
      const rect2 = new DOMRect(10, 20, 100, 200);

      expect(rectEquals(rect1, rect2)).toBe(true);
    });

    it('should return false for rectangles with different x coordinates', () => {
      const rect1 = new DOMRect(10, 20, 100, 200);
      const rect2 = new DOMRect(15, 20, 100, 200);

      expect(rectEquals(rect1, rect2)).toBe(false);
    });

    it('should return false for rectangles with different y coordinates', () => {
      const rect1 = new DOMRect(10, 20, 100, 200);
      const rect2 = new DOMRect(10, 25, 100, 200);

      expect(rectEquals(rect1, rect2)).toBe(false);
    });

    it('should return false for rectangles with different width', () => {
      const rect1 = new DOMRect(10, 20, 100, 200);
      const rect2 = new DOMRect(10, 20, 150, 200);

      expect(rectEquals(rect1, rect2)).toBe(false);
    });

    it('should return false for rectangles with different height', () => {
      const rect1 = new DOMRect(10, 20, 100, 200);
      const rect2 = new DOMRect(10, 20, 100, 250);

      expect(rectEquals(rect1, rect2)).toBe(false);
    });

    it('should handle zero values correctly', () => {
      const rect1 = new DOMRect(0, 0, 0, 0);
      const rect2 = new DOMRect(0, 0, 0, 0);

      expect(rectEquals(rect1, rect2)).toBe(true);
    });

    it('should handle negative values correctly', () => {
      const rect1 = new DOMRect(-10, -20, 100, 200);
      const rect2 = new DOMRect(-10, -20, 100, 200);

      expect(rectEquals(rect1, rect2)).toBe(true);
    });

    it('should handle floating point values correctly', () => {
      const rect1 = new DOMRect(10.5, 20.7, 100.3, 200.9);
      const rect2 = new DOMRect(10.5, 20.7, 100.3, 200.9);

      expect(rectEquals(rect1, rect2)).toBe(true);
    });
  });

  describe('#parentNodeToString', () => {
    it('should return empty string for node with no children', () => {
      const emptyDiv = document.createElement('div');

      expect(parentNodeToString(emptyDiv)).toBe('');
    });

    it('should return HTML string for node with single child', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      child.textContent = 'Hello';
      parent.appendChild(child);

      expect(parentNodeToString(parent)).toBe('<span>Hello</span>');
    });

    it('should return concatenated HTML for node with multiple children', () => {
      const parent = document.createElement('div');

      const child1 = document.createElement('span');
      child1.textContent = 'First';

      const child2 = document.createElement('p');
      child2.textContent = 'Second';

      parent.appendChild(child1);
      parent.appendChild(child2);

      expect(parentNodeToString(parent)).toBe(
        '<span>First</span><p>Second</p>'
      );
    });

    it('should handle children with attributes', () => {
      const parent = document.createElement('div');
      const child = document.createElement('a');
      child.href = 'https://example.com';
      child.className = 'link';
      child.textContent = 'Link';
      parent.appendChild(child);

      expect(parentNodeToString(parent)).toBe(
        '<a href="https://example.com" class="link">Link</a>'
      );
    });

    it('should handle nested children', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      const grandchild = document.createElement('span');
      grandchild.textContent = 'Nested';
      child.appendChild(grandchild);
      parent.appendChild(child);

      expect(parentNodeToString(parent)).toBe('<div><span>Nested</span></div>');
    });

    it('should handle document fragment', () => {
      const fragment = document.createDocumentFragment();
      const child1 = document.createElement('span');
      child1.textContent = 'Fragment child 1';
      const child2 = document.createElement('div');
      child2.textContent = 'Fragment child 2';

      fragment.appendChild(child1);
      fragment.appendChild(child2);

      expect(parentNodeToString(fragment)).toBe(
        '<span>Fragment child 1</span><div>Fragment child 2</div>'
      );
    });
  });

  describe('#closest', () => {
    it('should return the element itself when it matches the selector', () => {
      const div = document.createElement('div');
      div.className = 'target';
      container.appendChild(div);

      expect(closest(div, '.target')).toBe(div);
    });

    it('should return the element itself when both element and parent match selector', () => {
      const parent = document.createElement('div');
      parent.className = 'target';
      const child = document.createElement('div');
      child.className = 'target';
      parent.appendChild(child);
      container.appendChild(parent);

      expect(closest(child, '.target')).toBe(child);
    });

    it('should return null for null element', () => {
      expect(closest(null, '.target')).toBe(null);
    });

    it('should return parent element when it matches selector', () => {
      const parent = document.createElement('div');
      parent.className = 'parent';
      const child = document.createElement('span');
      parent.appendChild(child);
      container.appendChild(parent);

      expect(closest(child, '.parent')).toBe(parent);
    });

    it('should return ancestor element when it matches selector', () => {
      const grandparent = document.createElement('div');
      grandparent.className = 'grandparent';
      const parent = document.createElement('div');
      const child = document.createElement('span');

      parent.appendChild(child);
      grandparent.appendChild(parent);
      container.appendChild(grandparent);

      expect(closest(child, '.grandparent')).toBe(grandparent);
    });

    it('should return null when no ancestor matches selector', () => {
      const parent = document.createElement('div');
      parent.className = 'parent';
      const child = document.createElement('span');
      parent.appendChild(child);
      container.appendChild(parent);

      expect(closest(child, '.nonexistent')).toBe(null);
    });

    it('should work with tag name selectors', () => {
      const div = document.createElement('div');
      const span = document.createElement('span');
      div.appendChild(span);
      container.appendChild(div);

      expect(closest(span, 'div')).toBe(div);
    });

    it('should work with ID selectors', () => {
      const parent = document.createElement('div');
      parent.id = 'unique-id';
      const child = document.createElement('span');
      parent.appendChild(child);
      container.appendChild(parent);

      expect(closest(child, '#unique-id')).toBe(parent);
    });

    it('should work with attribute selectors', () => {
      const parent = document.createElement('div');
      parent.setAttribute('data-test', 'value');
      const child = document.createElement('span');
      parent.appendChild(child);
      container.appendChild(parent);

      expect(closest(child, '[data-test="value"]')).toBe(parent);
    });

    it('should handle complex selectors', () => {
      const parent = document.createElement('div');
      parent.className = 'parent active';
      parent.setAttribute('data-role', 'container');
      const child = document.createElement('span');
      parent.appendChild(child);
      container.appendChild(parent);

      expect(closest(child, 'div.parent.active[data-role="container"]')).toBe(
        parent
      );
    });

    it('should traverse through shadow root boundaries', () => {
      // Create a custom element with shadow DOM
      class TestElement extends HTMLElement {
        constructor() {
          super();
          const shadow = this.attachShadow({mode: 'open'});
          const div = document.createElement('div');
          div.className = 'shadow-content';
          shadow.appendChild(div);
        }
      }

      customElements.define('test-element', TestElement);

      const hostElement = document.createElement('test-element');
      hostElement.className = 'host';
      container.appendChild(hostElement);

      const shadowContent =
        hostElement.shadowRoot!.querySelector('.shadow-content')!;

      expect(closest(shadowContent, '.host')).toBe(hostElement);
    });

    it('should stop at document boundary', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      // Should not find html element
      expect(closest(element, 'body')).toBe(document.body);

      document.body.removeChild(element);
    });
  });

  describe('#isInDocument', () => {
    it('should return true for element attached to the document tree', () => {
      const el = document.createElement('div');
      container.appendChild(el);
      expect(isInDocument(el)).toBe(true);
    });

    it('should return true for descendants of attached nodes', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      container.appendChild(parent);
      expect(isInDocument(child)).toBe(true);
    });

    it('should return true for elements inside an attached shadow DOM', () => {
      const host = document.createElement('div');
      container.appendChild(host);
      const shadow = host.attachShadow({mode: 'open'});
      const shadowChild = document.createElement('span');
      shadow.appendChild(shadowChild);
      expect(isInDocument(shadowChild)).toBe(true);
    });

    it('should return false for nodes not attached to the document', () => {
      const el = document.createElement('div');
      expect(isInDocument(el)).toBe(false);
    });
  });

  describe('#parseHTML', () => {
    it('should parse HTML strings into a document', () => {
      const doc = parseHTML('<div class="wrapper">Hello</div>');
      expect(doc.body.innerHTML).toBe('<div class="wrapper">Hello</div>');
    });
  });

  describe('#parseXML', () => {
    it('should parse XML strings into a document', () => {
      const doc = parseXML('<items><item id="1"/></items>');
      expect(doc.querySelector('item')?.getAttribute('id')).toBe('1');
    });
  });

  describe('#isElementNode', () => {
    it('should detect element nodes', () => {
      const element = document.createElement('div');
      expect(isElementNode(element)).toBe(true);
    });

    it('should return false for non-element nodes', () => {
      const textNode = document.createTextNode('value');
      expect(isElementNode(textNode)).toBe(false);
    });
  });

  describe('#isTextNode', () => {
    it('should detect text nodes', () => {
      const textNode = document.createTextNode('value');
      expect(isTextNode(textNode)).toBe(true);
    });

    it('should return false for elements', () => {
      const element = document.createElement('div');
      expect(isTextNode(element)).toBe(false);
    });
  });

  describe('#isVisualNode', () => {
    it('should treat visible elements as visual nodes', () => {
      const element = document.createElement('div');
      expect(isVisualNode(element)).toBe(true);
    });

    it('should ignore style elements', () => {
      const styleEl = document.createElement('style');
      expect(isVisualNode(styleEl)).toBe(false);
    });

    it('should consider text nodes with content as visual', () => {
      const text = document.createTextNode('content');
      expect(isVisualNode(text)).toBe(true);
    });

    it('should ignore whitespace-only text nodes', () => {
      const text = document.createTextNode('   ');
      expect(isVisualNode(text)).toBe(false);
    });
  });

  describe('#containsVisualElement', () => {
    it('should detect visual descendants', () => {
      const parent = document.createElement('div');
      parent.appendChild(document.createElement('span'));
      expect(containsVisualElement(parent)).toBe(true);
    });

    it('should ignore non-visual children', () => {
      const parent = document.createElement('div');
      parent.appendChild(document.createElement('style'));
      const text = document.createTextNode('   ');
      parent.appendChild(text);
      expect(containsVisualElement(parent)).toBe(false);
    });
  });

  describe('#elementHasAncestorTag', () => {
    it('should find ancestors regardless of tag case', () => {
      const ancestor = document.createElement('section');
      const child = document.createElement('div');
      ancestor.appendChild(child);
      container.appendChild(ancestor);

      expect(elementHasAncestorTag(child, 'SECTION')).toBe(true);
      expect(elementHasAncestorTag(child, 'article')).toBe(false);
    });
  });

  describe('#sanitizeStyle', () => {
    it('should retain safe CSS declarations', () => {
      const sanitized = sanitizeStyle('body { color: red; }');

      expect(sanitized).toBe('body { color: red; }');
    });

    it('should drop unsafe markup from style content', () => {
      const sanitized = sanitizeStyle(
        'body { color: red; }<script>alert("x")</script>'
      );

      expect(sanitized).toBeUndefined();
    });
  });

  describe('#getFocusedElement', () => {
    it('should return the deepest focused element across shadow roots', () => {
      const host = document.createElement('div');
      host.tabIndex = -1;
      const shadow = host.attachShadow({mode: 'open'});
      const button = document.createElement('button');
      shadow.appendChild(button);
      container.appendChild(host);

      const originalActiveElementDescriptor = Object.getOwnPropertyDescriptor(
        Document.prototype,
        'activeElement'
      );

      Object.defineProperty(Document.prototype, 'activeElement', {
        configurable: true,
        get: () => host,
      });

      Object.defineProperty(shadow, 'activeElement', {
        configurable: true,
        get: () => button,
      });

      expect(getFocusedElement()).toBe(button);

      if (originalActiveElementDescriptor) {
        Object.defineProperty(
          Document.prototype,
          'activeElement',
          originalActiveElementDescriptor
        );
      } else {
        delete (Document.prototype as unknown as Record<string, unknown>)
          .activeElement;
      }

      Reflect.deleteProperty(
        shadow as ShadowRoot & Record<string, unknown>,
        'activeElement'
      );
    });
  });

  describe('#isFocusingOut', () => {
    it('should return true when moving focus outside of the current target', () => {
      const currentTarget = document.createElement('div');
      const event = new FocusEvent('focusout');
      Object.defineProperty(event, 'currentTarget', {value: currentTarget});
      Object.defineProperty(event, 'relatedTarget', {value: null});
      const hasFocusSpy = vi.spyOn(document, 'hasFocus').mockReturnValue(true);

      expect(isFocusingOut(event)).toBe(true);

      hasFocusSpy.mockRestore();
    });

    it('should return false when focus stays within the current target tree', () => {
      const currentTarget = document.createElement('div');
      const child = document.createElement('button');
      currentTarget.appendChild(child);

      const event = new FocusEvent('focusout');
      Object.defineProperty(event, 'currentTarget', {value: currentTarget});
      Object.defineProperty(event, 'relatedTarget', {value: child});
      const hasFocusSpy = vi.spyOn(document, 'hasFocus').mockReturnValue(true);

      expect(isFocusingOut(event)).toBe(false);

      hasFocusSpy.mockRestore();
    });
  });

  describe('#getParent', () => {
    it('should return the parent element when available', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      expect(getParent(child)).toBe(parent);
    });

    it('should return the host when called on a shadow root', () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({mode: 'open'});
      expect(getParent(shadow)).toBe(host);
    });
  });

  describe('#isAncestorOf', () => {
    it('should return true for standard ancestor relationships', () => {
      const ancestor = document.createElement('div');
      const child = document.createElement('span');
      ancestor.appendChild(child);
      expect(isAncestorOf(ancestor, child)).toBe(true);
    });

    it('should account for assigned slots', async () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({mode: 'open'});
      const slot = document.createElement('slot');
      slot.name = 'content';
      shadow.appendChild(slot);

      const slottedChild = document.createElement('span');
      slottedChild.slot = 'content';
      host.appendChild(slottedChild);

      container.appendChild(host);
      await Promise.resolve();

      expect(isAncestorOf(slot, slottedChild)).toBe(true);
    });

    it('should return false when no ancestral relationship exists', () => {
      const one = document.createElement('div');
      const two = document.createElement('div');
      expect(isAncestorOf(one, two)).toBe(false);
    });
  });

  describe('#sortByDocumentPosition', () => {
    it('should sort nodes based on their document order', () => {
      const first = document.createElement('div');
      const second = document.createElement('div');
      container.appendChild(first);
      container.appendChild(second);

      const nodes = [second, first].sort(sortByDocumentPosition);
      expect(nodes).toEqual([first, second]);
    });
  });
});
