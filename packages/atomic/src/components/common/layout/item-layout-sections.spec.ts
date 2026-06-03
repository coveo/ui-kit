import {beforeEach, describe, expect, it} from 'vitest';
import {
  containsSections,
  type ItemSectionTagName,
  isResultSectionNode,
} from './item-layout-sections';

const validSectionTags: ItemSectionTagName[] = [
  'atomic-result-section-visual',
  'atomic-result-section-badges',
  'atomic-result-section-actions',
  'atomic-result-section-title',
  'atomic-result-section-title-metadata',
  'atomic-result-section-emphasized',
  'atomic-result-section-excerpt',
  'atomic-result-section-bottom-metadata',
  'atomic-result-section-children',
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

const invalidTags = [
  'div',
  'span',
  'atomic-custom-element',
  'atomic-result-title',
  'atomic-product-title',
  'atomic-result-section',
  'atomic-product-section',
  'atomic-section-product-visual',
];

describe('item-layout-sections', () => {
  describe('#isResultSectionNode', () => {
    describe('with section elements', () => {
      it.each(validSectionTags)(
        'should return true for %s element',
        (tagName) => {
          const element = document.createElement(tagName);
          expect(isResultSectionNode(element)).toBe(true);

          const upperElement = document.createElement(tagName);
          Object.defineProperty(upperElement, 'tagName', {
            value: tagName.toUpperCase(),
            writable: false,
          });
          expect(isResultSectionNode(upperElement)).toBe(true);
        }
      );
    });

    describe('with non-section elements', () => {
      it.each(invalidTags)('should return false for %s element', (tagName) => {
        const element = document.createElement(tagName);
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
      describe.each(validSectionTags)('when string contains %s', (tagName) => {
        it('should return true with opening and closing tags', () => {
          const content = `<${tagName}>Content</${tagName}>`;
          expect(containsSections(content)).toBe(true);
        });

        it('should return true with self-closing tag', () => {
          const content = `<${tagName} />`;
          expect(containsSections(content)).toBe(true);
        });

        it('should return true when nested in HTML', () => {
          const content = `<div><${tagName}>Content</${tagName}></div>`;
          expect(containsSections(content)).toBe(true);
        });
      });

      describe.each(invalidTags)('when string contains %s', (tagName) => {
        it('should return false', () => {
          const content = `<${tagName}>Content</${tagName}>`;
          expect(containsSections(content)).toBe(false);
        });
      });

      it('should return false when string is empty', () => {
        expect(containsSections('')).toBe(false);
      });
    });

    describe('with NodeList content', () => {
      let container: HTMLElement;

      beforeEach(() => {
        container = document.createElement('div');
      });

      describe.each(validSectionTags)(
        'when NodeList contains %s',
        (tagName) => {
          it('should return true', () => {
            const sectionElement = document.createElement(tagName);
            container.appendChild(sectionElement);

            expect(containsSections(container.childNodes)).toBe(true);
          });
        }
      );

      describe.each(invalidTags)(
        'when NodeList contains only %s elements',
        (tagName) => {
          it('should return false', () => {
            const element = document.createElement(tagName);
            container.appendChild(element);

            expect(containsSections(container.childNodes)).toBe(false);
          });
        }
      );

      it('should return true when section is mixed with other nodes', () => {
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

      it('should return false when NodeList is empty', () => {
        expect(containsSections(container.childNodes)).toBe(false);
      });
    });

    describe('with HTMLCollection content', () => {
      let container: HTMLElement;

      beforeEach(() => {
        container = document.createElement('div');
      });

      describe.each(validSectionTags)(
        'when HTMLCollection contains %s',
        (tagName) => {
          it('should return true', () => {
            const sectionElement = document.createElement(tagName);
            container.appendChild(sectionElement);

            expect(containsSections(container.children)).toBe(true);
          });

          it('should return true when nested in wrapper', () => {
            const wrapper = document.createElement('div');
            const nestedSection = document.createElement(tagName);
            wrapper.appendChild(nestedSection);
            container.appendChild(wrapper);

            expect(containsSections(container.children)).toBe(false);
            expect(containsSections(wrapper.children)).toBe(true);
          });
        }
      );

      describe.each(invalidTags)(
        'when HTMLCollection contains only %s elements',
        (tagName) => {
          it('should return false', () => {
            const element = document.createElement(tagName);
            container.appendChild(element);

            expect(containsSections(container.children)).toBe(false);
          });
        }
      );

      it('should return true when section is mixed with other elements', () => {
        const regularElement = document.createElement('div');
        const sectionElement = document.createElement(
          'atomic-result-section-title'
        );

        container.appendChild(regularElement);
        container.appendChild(sectionElement);

        expect(containsSections(container.children)).toBe(true);
      });

      it('should return true when HTMLCollection contains multiple different section types', () => {
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

      it('should return false when HTMLCollection is empty', () => {
        expect(containsSections(container.children)).toBe(false);
      });
    });
  });
});
