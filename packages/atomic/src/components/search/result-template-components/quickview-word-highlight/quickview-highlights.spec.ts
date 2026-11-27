import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import type {HighlightKeywords} from '@/src/components/search/atomic-quickview-modal/highlight-keywords';
import {QuickviewHighlights} from './quickview-highlights';
import {QuickviewWordHighlight} from './quickview-word-highlight';

describe('QuickviewHighlights', () => {
  let iframe: HTMLIFrameElement;
  let iframeDocument: Document;
  let words: Record<string, QuickviewWordHighlight>;
  let highlights: QuickviewHighlights;

  const allEnabled: HighlightKeywords = {highlightNone: false, keywords: {}};

  const registry = () => (iframe.contentWindow as Window & typeof globalThis).CSS.highlights;

  beforeEach(() => {
    iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframeDocument = iframe.contentDocument!;
    iframeDocument.body.innerHTML = '<p>alpha beta alpha</p>';
    const text = iframeDocument.querySelector('p')!.firstChild!;
    const rangeOf = (start: number, end: number) => {
      const range = iframeDocument.createRange();
      range.setStart(text, start);
      range.setEnd(text, end);
      return range;
    };

    words = {
      '1': new QuickviewWordHighlight('1', 'alpha', 'rgb(255, 255, 0)', [
        rangeOf(0, 5),
        rangeOf(11, 16),
      ]),
      '2': new QuickviewWordHighlight('2', 'beta', 'rgb(0, 255, 255)', [rangeOf(6, 10)]),
    };

    highlights = new QuickviewHighlights();
  });

  afterEach(() => {
    highlights.detach();
    iframe.remove();
  });

  describe('when attached', () => {
    beforeEach(() => {
      highlights.attach(iframe, words);
    });

    it('should build the highlights in the iframe realm', () => {
      const IframeHighlight = (iframe.contentWindow as Window & typeof globalThis).Highlight;
      expect(words['1'].highlight).toBeInstanceOf(IframeHighlight);
    });

    it('should adopt one stylesheet in the iframe document', () => {
      expect(iframeDocument.adoptedStyleSheets).toHaveLength(1);
    });

    it('should declare a ::highlight() rule for each keyword', () => {
      const cssText = Array.from(iframeDocument.adoptedStyleSheets[0].cssRules)
        .map((rule) => rule.cssText)
        .join('\n');
      expect(cssText).toContain('::highlight(coveo-quickview-keyword-1)');
      expect(cssText).toContain('::highlight(coveo-quickview-keyword-2-focused)');
    });

    it('should not register any highlight before update is called', () => {
      expect(registry().size).toBe(0);
    });

    describe('when every keyword is enabled', () => {
      beforeEach(() => {
        highlights.update(allEnabled);
      });

      it('should register the keyword and focused highlights of every keyword', () => {
        expect(registry().get('coveo-quickview-keyword-1')).toBe(words['1'].highlight);
        expect(registry().get('coveo-quickview-keyword-1-focused')).toBe(
          words['1'].focusedHighlight
        );
        expect(registry().get('coveo-quickview-keyword-2')).toBe(words['2'].highlight);
      });

      it('should not modify the iframe DOM', () => {
        expect(iframeDocument.body.innerHTML).toBe('<p>alpha beta alpha</p>');
      });
    });

    describe('when one keyword is disabled', () => {
      beforeEach(() => {
        highlights.update(allEnabled);
        highlights.update({
          highlightNone: false,
          keywords: {alpha: {enabled: false, indexIdentifier: '1'}},
        });
      });

      it('should unregister only the disabled keyword', () => {
        expect(registry().has('coveo-quickview-keyword-1')).toBe(false);
        expect(registry().has('coveo-quickview-keyword-1-focused')).toBe(false);
        expect(registry().has('coveo-quickview-keyword-2')).toBe(true);
      });
    });

    describe('when highlightNone is set', () => {
      beforeEach(() => {
        highlights.update(allEnabled);
        highlights.update({
          highlightNone: true,
          keywords: {beta: {enabled: true, indexIdentifier: '2'}},
        });
      });

      it('should unregister every keyword', () => {
        expect(registry().size).toBe(0);
      });
    });

    describe('when detached', () => {
      beforeEach(() => {
        highlights.update(allEnabled);
        highlights.detach();
      });

      it('should unregister every keyword', () => {
        expect(registry().size).toBe(0);
      });

      it('should remove its stylesheet from the iframe document', () => {
        expect(iframeDocument.adoptedStyleSheets).toHaveLength(0);
      });

      it('should ignore later updates', () => {
        highlights.update(allEnabled);
        expect(registry().size).toBe(0);
      });
    });

    describe('when attached again with new words', () => {
      beforeEach(() => {
        highlights.update(allEnabled);
        highlights.attach(iframe, {'2': words['2']});
        highlights.update(allEnabled);
      });

      it('should drop the previous keywords', () => {
        expect(registry().has('coveo-quickview-keyword-1')).toBe(false);
        expect(registry().has('coveo-quickview-keyword-2')).toBe(true);
      });

      it('should keep a single stylesheet', () => {
        expect(iframeDocument.adoptedStyleSheets).toHaveLength(1);
      });
    });
  });

  describe('when the iframe document is not accessible', () => {
    it('should do nothing', () => {
      const detachedIframe = document.createElement('iframe');
      expect(() => {
        highlights.attach(detachedIframe, words);
        highlights.update(allEnabled);
      }).not.toThrow();
    });
  });
});
