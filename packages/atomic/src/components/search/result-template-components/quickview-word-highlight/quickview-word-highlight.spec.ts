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

  function createHighlight(
    id: string,
    text: string,
    el?: HTMLElement
  ): QuickviewWordHighlight {
    const element = el ?? createElement();
    return new QuickviewWordHighlight(id, text, baseColor, element);
  }

  function expectHighlighted(element: HTMLElement) {
    expect(element.style.color).toBe(baseColor);
    expect(element.style.backgroundColor).toBe(focusedColor);
  }

  function expectNotHighlighted(element: HTMLElement) {
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

    describe('when no navigation has occurred', () => {
      it('should not apply any highlighting styles', () => {
        expectNotHighlighted(element);
      });
    });

    describe('when navigating forward', () => {
      beforeEach(() => {
        highlight.navigateForward();
      });

      it('should apply highlighting styles to the focused element', () => {
        expectHighlighted(element);
      });

      describe('when navigating forward again', () => {
        beforeEach(() => {
          highlight.navigateForward();
        });

        it('should reapply highlighting styles to the focused element', () => {
          expectHighlighted(element);
        });
      });

      describe('when navigating backward', () => {
        beforeEach(() => {
          highlight.navigateBackward();
        });

        it('should reapply highlighting styles to the focused element', () => {
          expectHighlighted(element);
        });
      });
    });

    describe('when navigating backward from initial state', () => {
      beforeEach(() => {
        highlight.navigateBackward();
      });

      it('should apply highlighting styles to the focused element', () => {
        expect(element.style.color).toBe(baseColor);
        expect(element.style.backgroundColor).toBe(focusedColor);
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

    describe('when no navigation has occurred', () => {
      it('should not apply any highlighting styles to either element', () => {
        expectNotHighlighted(element1);
        expectNotHighlighted(element2);
      });
    });

    describe('when navigating forward', () => {
      beforeEach(() => {
        highlight.navigateForward();
      });

      it('should apply highlighting styles to the first element only', () => {
        expectHighlighted(element1);
        expectNotHighlighted(element2);
      });

      describe('when navigating forward again', () => {
        beforeEach(() => {
          highlight.navigateForward();
        });

        it('should apply highlighting styles to the second element only', () => {
          expectNotHighlighted(element1);
          expectHighlighted(element2);
        });

        describe('when navigating forward a third time', () => {
          beforeEach(() => {
            highlight.navigateForward();
          });

          it('should loop and apply highlighting to the first element again', () => {
            expectHighlighted(element1);
            expectNotHighlighted(element2);
          });
        });
      });
    });

    describe('when navigating backward from initial state', () => {
      beforeEach(() => {
        highlight.navigateBackward();
      });

      it('should apply highlighting styles to the last element (loop backward)', () => {
        expectNotHighlighted(element1);
        expectHighlighted(element2);
      });
    });
  });
});
