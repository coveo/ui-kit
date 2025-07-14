import {describe, expect, it} from 'vitest';
import {
  type HighlightKeywords,
  type HighlightString,
  renderWithHighlights,
} from './render-highlights';

describe('render-highlights', () => {
  const mockHighlightString: HighlightString = ({
    content,
    openingDelimiter,
    closingDelimiter,
    highlights,
  }) => {
    let result = content;
    const sortedHighlights = [...highlights].sort(
      (a, b) => b.offset - a.offset
    );

    for (const highlight of sortedHighlights) {
      const before = result.slice(0, highlight.offset);
      const highlighted = result.slice(
        highlight.offset,
        highlight.offset + highlight.length
      );
      const after = result.slice(highlight.offset + highlight.length);
      result =
        before + openingDelimiter + highlighted + closingDelimiter + after;
    }

    return result;
  };

  describe('#renderWithHighlights', () => {
    it('should wrap highlighted text with bold tags', () => {
      const value = 'Hello world';
      const highlights: HighlightKeywords[] = [{offset: 0, length: 5}];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );
      expect(result).toBe('<b>Hello</b> world');
    });

    it('should handle multiple highlights', () => {
      const value = 'Hello beautiful world';
      const highlights: HighlightKeywords[] = [
        {offset: 0, length: 5},
        {offset: 16, length: 5},
      ];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );
      expect(result).toBe('<b>Hello</b> beautiful <b>world</b>');
    });

    it('should handle adjacent highlights', () => {
      const value = 'HelloWorld';
      const highlights: HighlightKeywords[] = [
        {offset: 0, length: 5},
        {offset: 5, length: 5},
      ];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );

      expect(result).toBe('<b>Hello</b><b>World</b>');
    });

    it('should return original text when no highlights are provided', () => {
      const value = 'Hello world';
      const highlights: HighlightKeywords[] = [];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );

      expect(result).toBe('Hello world');
    });

    it('should handle empty string', () => {
      const value = '';
      const highlights: HighlightKeywords[] = [];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );

      expect(result).toBe('');
    });

    it('should handle highlighting entire string', () => {
      const value = 'Hello';
      const highlights: HighlightKeywords[] = [{offset: 0, length: 5}];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );

      expect(result).toBe('<b>Hello</b>');
    });

    it('should handle single character highlight', () => {
      const value = 'Hello world';
      const highlights: HighlightKeywords[] = [{offset: 6, length: 1}];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );

      // eslint-disable-next-line @cspell/spellchecker
      expect(result).toBe('Hello <b>w</b>orld');
    });

    it('should handle highlight at the end of string', () => {
      const value = 'Hello world';
      const highlights: HighlightKeywords[] = [{offset: 6, length: 5}];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );

      expect(result).toBe('Hello <b>world</b>');
    });

    it('should handle multiple non-overlapping highlights in random order', () => {
      const value = 'The quick brown fox jumps';
      const highlights: HighlightKeywords[] = [
        {offset: 16, length: 3}, // fox
        {offset: 4, length: 5}, // quick
        {offset: 0, length: 3}, // The
      ];

      const result = renderWithHighlights(
        value,
        highlights,
        mockHighlightString
      );

      expect(result).toBe('<b>The</b> <b>quick</b> brown <b>fox</b> jumps');
    });

    describe('when dealing with special characters in text', () => {
      it('should handle text with special regex characters', () => {
        const value = 'Hello (world) [test]';
        const highlights: HighlightKeywords[] = [
          {offset: 6, length: 7}, // (world)
          {offset: 14, length: 6}, // [test]
        ];

        const result = renderWithHighlights(
          value,
          highlights,
          mockHighlightString
        );

        expect(result).toBe('Hello <b>(world)</b> <b>[test]</b>');
      });

      it('should handle text with existing HTML-like tags', () => {
        const value = 'Hello <span>world</span>';
        const highlights: HighlightKeywords[] = [{offset: 6, length: 5}];

        const result = renderWithHighlights(
          value,
          highlights,
          mockHighlightString
        );

        expect(result).toBe('Hello <b><span</b>>world</span>');
      });
    });

    describe('when highlights have zero length', () => {
      it('should handle zero-length highlights gracefully', () => {
        const value = 'Hello world';
        const highlights: HighlightKeywords[] = [{offset: 5, length: 0}];

        const result = renderWithHighlights(
          value,
          highlights,
          mockHighlightString
        );

        expect(result).toBe('Hello<b></b> world');
      });
    });

    describe('when using different highlightString implementations', () => {
      it('should work with a highlightString that adds custom wrappers', () => {
        const customHighlightString: HighlightString = ({
          content,
          openingDelimiter,
          closingDelimiter,
          highlights,
        }) => {
          let result = content;
          const sortedHighlights = [...highlights].sort(
            (a, b) => b.offset - a.offset
          );

          for (const highlight of sortedHighlights) {
            const before = result.slice(0, highlight.offset);
            const highlighted = result.slice(
              highlight.offset,
              highlight.offset + highlight.length
            );
            const after = result.slice(highlight.offset + highlight.length);
            result =
              before +
              '[START]' +
              openingDelimiter +
              highlighted +
              closingDelimiter +
              '[END]' +
              after;
          }

          return result;
        };

        const value = 'Hello world';
        const highlights: HighlightKeywords[] = [{offset: 0, length: 5}];

        const result = renderWithHighlights(
          value,
          highlights,
          customHighlightString
        );

        expect(result).toBe('[START]<b>Hello</b>[END] world');
      });
    });
  });
});
