import {beforeEach, describe, expect, it, vi} from 'vitest';
import {QuickviewWordHighlight} from './quickview-word-highlight';

describe('QuickviewWordHighlight', () => {
  const baseColor = 'rgb(10, 20, 30)';
  const focusedColor = 'rgb(245, 235, 225)';
  const previewBorderColor = 'rgb(0, 15, 30)';

  let iframe: HTMLIFrameElement;
  let iframeDocument: Document;

  beforeEach(() => {
    iframe?.remove();
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframeDocument = iframe.contentDocument!;
    iframeDocument.body.innerHTML = '<p>keyword one</p><p>keyword two</p>';
  });

  function createRange(index: number) {
    const text = iframeDocument.querySelectorAll('p')[index].firstChild!;
    const range = iframeDocument.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 'keyword'.length);
    return range;
  }

  function focusedRanges(highlight: QuickviewWordHighlight) {
    return Array.from(highlight.focusedHighlight) as Range[];
  }

  describe('with one range', () => {
    let range: Range;
    let highlight: QuickviewWordHighlight;

    beforeEach(() => {
      range = createRange(0);
      highlight = new QuickviewWordHighlight('1', 'keyword', baseColor, [range]);
    });

    it('should initialize properties correctly', () => {
      expect(highlight.occurrences).toBe(1);
      expect(highlight.indexIdentifier).toBe('1');
      expect(highlight.text).toBe('keyword');
      expect(highlight.color).toBe(baseColor);
      expect(highlight.ranges).toEqual([range]);
    });

    it('should compute color properties correctly', () => {
      expect(highlight.focusedColor).toBe(focusedColor);
      expect(highlight.previewBorderColor).toBe(previewBorderColor);
    });

    it('should build its highlights in the realm of the ranges', () => {
      const IframeHighlight = (iframe.contentWindow as Window & typeof globalThis).Highlight;
      expect(highlight.highlight).toBeInstanceOf(IframeHighlight);
      expect(highlight.focusedHighlight).toBeInstanceOf(IframeHighlight);
    });

    it('should name its highlights after the index identifier', () => {
      expect(highlight.highlightName).toBe('coveo-quickview-keyword-1');
      expect(highlight.focusedHighlightName).toBe('coveo-quickview-keyword-1-focused');
    });

    it('should give the focused highlight priority over the keyword highlight', () => {
      expect(highlight.focusedHighlight.priority).toBeGreaterThan(highlight.highlight.priority);
    });

    it('should add the range to the keyword highlight', () => {
      expect(Array.from(highlight.highlight)).toEqual([range]);
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

    it('should not focus any occurrence before navigating', () => {
      expect(highlight.focusedHighlight.size).toBe(0);
    });

    describe('when navigating forward', () => {
      it('should focus and return the range', () => {
        expect(highlight.navigateForward()).toBe(range);
        expect(focusedRanges(highlight)).toEqual([range]);
      });

      it('should scroll the element containing the range into view', () => {
        const paragraph = iframeDocument.querySelector('p')!;
        const scrollIntoView = vi.spyOn(paragraph, 'scrollIntoView');

        highlight.navigateForward();

        expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
      });

      it('should keep the range focused when navigating again', () => {
        highlight.navigateForward();
        highlight.navigateForward();
        expect(focusedRanges(highlight)).toEqual([range]);
      });
    });

    describe('when navigating backward from initial state', () => {
      it('should focus the range', () => {
        highlight.navigateBackward();
        expect(focusedRanges(highlight)).toEqual([range]);
      });
    });
  });

  describe('with two ranges', () => {
    let range1: Range;
    let range2: Range;
    let highlight: QuickviewWordHighlight;

    beforeEach(() => {
      range1 = createRange(0);
      range2 = createRange(1);
      highlight = new QuickviewWordHighlight('1', 'keyword', baseColor, [range1, range2]);
    });

    it('should count both occurrences', () => {
      expect(highlight.occurrences).toBe(2);
      expect(highlight.highlight.size).toBe(2);
    });

    it('should focus the first range only when navigating forward', () => {
      highlight.navigateForward();
      expect(focusedRanges(highlight)).toEqual([range1]);
    });

    it('should focus the second range only when navigating forward twice', () => {
      highlight.navigateForward();
      highlight.navigateForward();
      expect(focusedRanges(highlight)).toEqual([range2]);
    });

    it('should loop back to the first range when navigating forward three times', () => {
      highlight.navigateForward();
      highlight.navigateForward();
      highlight.navigateForward();
      expect(focusedRanges(highlight)).toEqual([range1]);
    });

    it('should loop to the last range when navigating backward from initial state', () => {
      highlight.navigateBackward();
      expect(focusedRanges(highlight)).toEqual([range2]);
    });
  });
});
