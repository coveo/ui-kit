import type {TermsToHighlight} from '@coveo/headless';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {unsafeHTMLElement} from '@/vitest-utils/testing-helpers/testing-utils/unsafe-html-element';
import {getWordsHighlights, HIGHLIGHT_PREFIX} from './iframe-parser';

describe('getWordsHighlights', () => {
  const baseColor = 'rgb(10, 20, 30)';
  const stemmingInfo: TermsToHighlight = {
    keyword: ['keyword', 'keywords'],
    test: ['test', 'tests'],
  };

  describe('with no iframe', () => {
    it('should return an empty object', () => {
      const result = getWordsHighlights(stemmingInfo);

      expect(result).toEqual({});
    });
  });

  describe('with an iframe', () => {
    let iframe: HTMLIFrameElement;
    let iframeDoc: Document;
    let container: HTMLDivElement;

    beforeEach(() => {
      // Create a per-test container in the real document so iframe.contentDocument is available,
      // but keep it isolated and remove it in afterEach to avoid polluting the global document.
      container = document.createElement('div');
      document.body.appendChild(container);

      iframe = document.createElement('iframe') as HTMLIFrameElement;
      container.appendChild(iframe);

      iframeDoc = (iframe.contentDocument ||
        iframe.contentWindow?.document) as Document;
    });

    afterEach(() => {
      container?.parentNode?.removeChild(container);
      container = null!;
      iframe = null!;
      iframeDoc = null!;
    });

    describe('with no tagged words', () => {
      it('should return an empty object', () => {
        const result = getWordsHighlights(stemmingInfo, iframe);

        expect(result).toEqual({});
      });
    });

    describe('with tagged words', () => {
      function createTaggedWordElement(id: string, text: string): HTMLElement {
        return unsafeHTMLElement(
          `<coveotaggedword id="${HIGHLIGHT_PREFIX}.${id}.0.1" style="background-color: ${baseColor};"><span>${text}</span></coveotaggedword>`,
          iframeDoc
        );
      }

      function appendTaggedWordElement(id: string, text: string) {
        const el = createTaggedWordElement(id, text);
        iframeDoc.body.appendChild(el);
      }

      beforeEach(() => {
        appendTaggedWordElement('1', 'keyword');
        appendTaggedWordElement('1', 'keyword');
        appendTaggedWordElement('2', 'test');
      });

      it('should find and group highlights correctly', () => {
        const highlights = getWordsHighlights(stemmingInfo, iframe);

        expect(Object.keys(highlights)).toContain('1');
        expect(Object.keys(highlights)).toContain('2');
        expect(highlights['1'].occurrences).toBe(2);
        expect(highlights['2'].occurrences).toBe(1);
      });
    });

    describe('with invalid keyword identifier', () => {
      let element: HTMLElement;

      beforeEach(() => {
        element = unsafeHTMLElement(
          `<coveotaggedword id="${HIGHLIGHT_PREFIX}-invalid"></coveotaggedword>`,
          iframeDoc
        );
        iframeDoc.body.appendChild(element);
      });

      it('should throw an error', () => {
        expect(() => getWordsHighlights(stemmingInfo, iframe)).toThrow(
          'Invalid keyword identifier for quickview'
        );
      });
    });
  });
});
