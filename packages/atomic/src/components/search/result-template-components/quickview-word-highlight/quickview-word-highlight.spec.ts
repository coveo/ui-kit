import {beforeEach, describe, expect, it} from 'vitest';
import {QuickviewWordHighlight} from './quickview-word-highlight';

describe('QuickviewWordHighlight', () => {
  const baseColor = 'rgb(10, 20, 30)';
  const focusedColor = 'rgb(245, 235, 225)';
  const previewBorderColor = 'rgb(0, 15, 30)';

  let testDoc: Document;

  beforeEach(() => {
    testDoc = document.implementation.createHTMLDocument();
  });

  function createElement(): HTMLElement {
    const element = testDoc.createElement('div');
    element.style.backgroundColor = baseColor;
    return element;
  }

  function createHighlight(id: string, text: string, el?: HTMLElement): QuickviewWordHighlight {
    const element = el ?? createElement();
    return new QuickviewWordHighlight(id, text, baseColor, element);
  }

  function focusedElements(highlight: QuickviewWordHighlight) {
    return Array.from(highlight.focusedHighlight).map((range) => range.startContainer);
  }

  function expectFocused(highlight: QuickviewWordHighlight, element: HTMLElement) {
    expect(focusedElements(highlight)).toEqual([element]);
  }

  function expectNotFocused(highlight: QuickviewWordHighlight, element: HTMLElement) {
    expect(focusedElements(highlight)).not.toContain(element);
  }

  function expectUnchangedInlineStyles(element: HTMLElement) {
    expect(element.style.color).toBe('');
    expect(element.style.backgroundColor).toBe(baseColor);
  }

  describe('with one element', () => {
    let element: HTMLElement;
    let highlight: QuickviewWordHighlight;

    beforeEach(() => {
      highlight = createHighlight('1', 'keyword');
      element = highlight.elements[0];
    });

    it('should initialize properties correctly', () => {
      expect(highlight.occurrences).toBe(1);
      expect(highlight.indexIdentifier).toBe('1');
      expect(highlight.text).toBe('keyword');
      expect(highlight.color).toBe(baseColor);
    });

    it('should compute color properties correctly', () => {
      expect(highlight.focusedColor).toBe(focusedColor);
      expect(highlight.previewBorderColor).toBe(previewBorderColor);
    });

    it('should name its highlights after the index identifier', () => {
      expect(highlight.highlightName).toBe('coveo-quickview-keyword-1');
      expect(highlight.focusedHighlightName).toBe('coveo-quickview-keyword-1-focused');
    });

    it('should give the focused highlight priority over the keyword highlight', () => {
      expect(highlight.focusedHighlight.priority).toBeGreaterThan(highlight.highlight.priority);
    });

    it('should add a range covering the element to the keyword highlight', () => {
      const [range] = Array.from(highlight.highlight) as Range[];
      expect(highlight.highlight.size).toBe(1);
      expect(range.startContainer).toBe(element);
      expect(range.endContainer).toBe(element);
    });

    it('should generate ::highlight() styles with the keyword colors', () => {
      const styles = highlight.styles.replace(/\s+/g, ' ');
      expect(styles).toContain(
        `::highlight(coveo-quickview-keyword-1) { background-color: ${baseColor}; }`
      );
      expect(styles).toContain(
        `::highlight(coveo-quickview-keyword-1-focused) { color: ${baseColor}; background-color: ${focusedColor}; }`
      );
    });

    describe('when no navigation has occurred', () => {
      it('should not focus any occurrence', () => {
        expect(highlight.focusedHighlight.size).toBe(0);
      });
    });

    describe('when navigating forward', () => {
      beforeEach(() => {
        highlight.navigateForward();
      });

      it('should focus the element', () => {
        expectFocused(highlight, element);
      });

      it('should not change the element inline styles', () => {
        expectUnchangedInlineStyles(element);
      });

      describe('when navigating forward again', () => {
        beforeEach(() => {
          highlight.navigateForward();
        });

        it('should keep the element focused', () => {
          expectFocused(highlight, element);
        });
      });

      describe('when navigating backward', () => {
        beforeEach(() => {
          highlight.navigateBackward();
        });

        it('should keep the element focused', () => {
          expectFocused(highlight, element);
        });
      });
    });

    describe('when navigating backward from initial state', () => {
      beforeEach(() => {
        highlight.navigateBackward();
      });

      it('should focus the element', () => {
        expectFocused(highlight, element);
      });
    });
  });

  describe('with two elements', () => {
    let element1: HTMLElement;
    let element2: HTMLElement;
    let highlight: QuickviewWordHighlight;

    beforeEach(() => {
      element1 = createElement();
      element2 = createElement();
      highlight = createHighlight('1', 'keyword', element1);
      highlight.addElement(element2);
    });

    it('should track elements and occurrences', () => {
      expect(highlight.occurrences).toBe(2);
      expect(highlight.elements).toEqual([element1, element2]);
    });

    it('should add one range per element to the keyword highlight', () => {
      expect(highlight.highlight.size).toBe(2);
    });

    describe('when no navigation has occurred', () => {
      it('should not focus any occurrence', () => {
        expect(highlight.focusedHighlight.size).toBe(0);
      });
    });

    describe('when navigating forward', () => {
      beforeEach(() => {
        highlight.navigateForward();
      });

      it('should focus the first element only', () => {
        expectFocused(highlight, element1);
        expectNotFocused(highlight, element2);
      });

      describe('when navigating forward again', () => {
        beforeEach(() => {
          highlight.navigateForward();
        });

        it('should focus the second element only', () => {
          expectNotFocused(highlight, element1);
          expectFocused(highlight, element2);
        });

        describe('when navigating forward a third time', () => {
          beforeEach(() => {
            highlight.navigateForward();
          });

          it('should loop and focus the first element again', () => {
            expectFocused(highlight, element1);
            expectNotFocused(highlight, element2);
          });
        });
      });
    });

    describe('when navigating backward from initial state', () => {
      beforeEach(() => {
        highlight.navigateBackward();
      });

      it('should loop backward and focus the last element', () => {
        expectNotFocused(highlight, element1);
        expectFocused(highlight, element2);
      });
    });
  });
});
