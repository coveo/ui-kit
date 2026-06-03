import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {closest, parentNodeToString, rectEquals} from './dom-utils';

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
});
