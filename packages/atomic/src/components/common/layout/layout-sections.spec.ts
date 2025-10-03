import {beforeEach, describe, expect, it} from 'vitest';
import {
  containsSections,
  type ItemSectionTagName,
  isResultSectionNode,
} from './layout-sections';

describe('layout-sections', () => {
  describe('#isResultSectionNode', () => {
    describe('with result section elements', () => {
      const resultSectionTags: ItemSectionTagName[] = [
        'atomic-result-section-visual',
        'atomic-result-section-badges',
        'atomic-result-section-actions',
        'atomic-result-section-title',
        'atomic-result-section-title-metadata',
        'atomic-result-section-emphasized',
        'atomic-result-section-excerpt',
        'atomic-result-section-bottom-metadata',
        'atomic-result-section-children',
      ];

      it.each(resultSectionTags)(
        'should return true for %s element',
        (tagName) => {
          const element = document.createElement(tagName);
          expect(isResultSectionNode(element)).toBe(true);
        }
      );

      it.each(resultSectionTags)(
        'should return true for %s element with uppercase',
        (tagName) => {
          const element = document.createElement(tagName);
          Object.defineProperty(element, 'tagName', {
            value: tagName.toUpperCase(),
            writable: false,
          });
          expect(isResultSectionNode(element)).toBe(true);
        }
      );
    });

    describe('with product section elements', () => {
      const productSectionTags: ItemSectionTagName[] = [
        'atomic-product-section-visual',
        'atomic-product-section-badges',
        'atomic-product-section-actions',
        'atomic-product-section-name',
        'atomic-product-section-metadata',
        'atomic-product-section-emphasized',
        'atomic-product-section-description',
        'atomic-product-section-bottom-metadata',
        'atomic-product-section-children',
      ];

      it.each(productSectionTags)(
        'should return true for %s element',
        (tagName) => {
          const element = document.createElement(tagName);
          expect(isResultSectionNode(element)).toBe(true);
        }
      );
    });

    describe('with non-section elements', () => {
      it('should return false for regular div element', () => {
        const element = document.createElement('div');
        expect(isResultSectionNode(element)).toBe(false);
      });

      it('should return false for span element', () => {
        const element = document.createElement('span');
        expect(isResultSectionNode(element)).toBe(false);
      });

      it('should return false for custom non-section element', () => {
        const element = document.createElement('atomic-custom-element');
        expect(isResultSectionNode(element)).toBe(false);
      });

      it('should return false for atomic result element that is not a section', () => {
        const element = document.createElement('atomic-result-title');
        expect(isResultSectionNode(element)).toBe(false);
      });

      it('should return false for atomic product element that is not a section', () => {
        const element = document.createElement('atomic-product-title');
        expect(isResultSectionNode(element)).toBe(false);
      });
    });

    describe('with non-element nodes', () => {
      it('should return false for text node', () => {
        const textNode = document.createTextNode('Some text');
        expect(isResultSectionNode(textNode)).toBe(false);
      });

      it('should return false for comment node', () => {
        const commentNode = document.createComment('Some comment');
        expect(isResultSectionNode(commentNode)).toBe(false);
      });

      it('should return false for document fragment', () => {
        const fragment = document.createDocumentFragment();
        expect(isResultSectionNode(fragment)).toBe(false);
      });
    });
  });

  describe('#containsSections', () => {
    describe('with string content', () => {
      it('should return true when string contains result section tag', () => {
        const content =
          '<atomic-result-section-visual>Content</atomic-result-section-visual>';
        expect(containsSections(content)).toBe(true);
      });

      it('should return true when string contains product section tag', () => {
        const content =
          '<atomic-product-section-name>Product Name</atomic-product-section-name>';
        expect(containsSections(content)).toBe(true);
      });

      it('should return true when string contains multiple section tags', () => {
        const content = `
          <div>
            <atomic-result-section-title>Title</atomic-result-section-title>
            <atomic-product-section-visual>Visual</atomic-product-section-visual>
          </div>
        `;
        expect(containsSections(content)).toBe(true);
      });

      it('should return false when string contains no section tags', () => {
        const content = '<div><span>Regular content</span></div>';
        expect(containsSections(content)).toBe(false);
      });

      it('should return false when string contains similar but not exact section tags', () => {
        const content =
          '<atomic-result-section>Not a valid section</atomic-result-section>';
        expect(containsSections(content)).toBe(false);
      });

      it('should return true when section tag is part of larger HTML', () => {
        const content = `
          <div class="container">
            <h1>Title</h1>
            <atomic-result-section-excerpt class="excerpt">
              Some excerpt content
            </atomic-result-section-excerpt>
            <p>More content</p>
          </div>
        `;
        expect(containsSections(content)).toBe(true);
      });

      it('should handle empty string', () => {
        expect(containsSections('')).toBe(false);
      });
    });

    describe('with NodeList content', () => {
      let container: HTMLElement;

      beforeEach(() => {
        container = document.createElement('div');
      });

      it('should return true when NodeList contains section element', () => {
        const sectionElement = document.createElement(
          'atomic-result-section-visual'
        );
        const regularElement = document.createElement('div');
        container.appendChild(sectionElement);
        container.appendChild(regularElement);

        expect(containsSections(container.childNodes)).toBe(true);
      });

      it('should return true when NodeList contains product section element', () => {
        const sectionElement = document.createElement(
          'atomic-product-section-metadata'
        );
        container.appendChild(sectionElement);

        expect(containsSections(container.childNodes)).toBe(true);
      });

      it('should return false when NodeList contains no section elements', () => {
        const div = document.createElement('div');
        const span = document.createElement('span');
        const textNode = document.createTextNode('Text');
        container.appendChild(div);
        container.appendChild(span);
        container.appendChild(textNode);

        expect(containsSections(container.childNodes)).toBe(false);
      });

      it('should return false when NodeList is empty', () => {
        expect(containsSections(container.childNodes)).toBe(false);
      });

      it('should handle mixed content with text nodes and elements', () => {
        const textNode = document.createTextNode('Some text');
        const regularElement = document.createElement('p');
        const sectionElement = document.createElement(
          'atomic-result-section-actions'
        );

        container.appendChild(textNode);
        container.appendChild(regularElement);
        container.appendChild(sectionElement);

        expect(containsSections(container.childNodes)).toBe(true);
      });
    });

    describe('with HTMLCollection content', () => {
      let container: HTMLElement;

      beforeEach(() => {
        container = document.createElement('div');
      });

      it('should return true when HTMLCollection contains section element', () => {
        const sectionElement = document.createElement(
          'atomic-result-section-title'
        );
        const regularElement = document.createElement('div');
        container.appendChild(sectionElement);
        container.appendChild(regularElement);

        expect(containsSections(container.children)).toBe(true);
      });

      it('should return true when HTMLCollection contains multiple different section elements', () => {
        const resultSection = document.createElement(
          'atomic-result-section-visual'
        );
        const productSection = document.createElement(
          'atomic-product-section-emphasized'
        );
        container.appendChild(resultSection);
        container.appendChild(productSection);

        expect(containsSections(container.children)).toBe(true);
      });

      it('should return false when HTMLCollection contains no section elements', () => {
        const div = document.createElement('div');
        const span = document.createElement('span');
        const p = document.createElement('p');
        container.appendChild(div);
        container.appendChild(span);
        container.appendChild(p);

        expect(containsSections(container.children)).toBe(false);
      });

      it('should return false when HTMLCollection is empty', () => {
        expect(containsSections(container.children)).toBe(false);
      });

      it('should handle nested elements correctly', () => {
        const wrapper = document.createElement('div');
        const nestedSection = document.createElement(
          'atomic-product-section-badges'
        );
        wrapper.appendChild(nestedSection);
        container.appendChild(wrapper);

        expect(containsSections(container.children)).toBe(false);

        expect(containsSections(wrapper.children)).toBe(true);
      });
    });

    it('should handle self-closing section tags in string', () => {
      const content = '<atomic-result-section-visual />';
      expect(containsSections(content)).toBe(true);
    });
  });
});
