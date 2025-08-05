import {
  extractTextToHighlight,
  generateTextFragmentUrl,
} from '../citationAnchoringUtils';

describe('c/citationAnchoringUtils', () => {
  describe('extractTextToHighlight', () => {
    it('returns the first sentence of a passage', () => {
      const text =
        'This is the first sentence. This is the second sentence. This is the third sentence.';
      const result = extractTextToHighlight(text);
      expect(result).toBe('This is the first sentence.');
    });

    it('returns first full sentence even when passages begin in the middle of a sentence', () => {
      const text =
        'middle of a sentence. This is the first full sentence. This is the second sentence.';
      const result = extractTextToHighlight(text);
      expect(result).toBe('This is the first full sentence.');
    });

    it('returns the first five words as a fallback if no sentences are found', () => {
      const text = 'This is a test using the fallback';
      const result = extractTextToHighlight(text);
      expect(result).toBe('This is a test using');
    });

    it('handles text with fewer than 5 words', () => {
      const text = 'short text';
      const result = extractTextToHighlight(text);
      expect(result).toBe('short text');
    });

    it('handles empty strings', () => {
      const text = '';
      const result = extractTextToHighlight(text);
      expect(result).toBe('');
    });

    it('trims whitespace from extracted sentence', () => {
      const text =
        '   This is a sentence with leading spaces. This is another sentence.';
      const result = extractTextToHighlight(text);
      expect(result).toBe('This is a sentence with leading spaces.');
    });

    it("handles text with decimal numbers that shouldn't break sentence detection", () => {
      const text =
        'This sentence has the decimal 3.1415 in it. This is another sentence.';
      const result = extractTextToHighlight(text);
      expect(result).toBe('This sentence has the decimal 3.1415 in it.');
    });

    it('handles ellipses in sentences', () => {
      const text = 'This is the first sentence... This is the second sentence.';
      const result = extractTextToHighlight(text);
      expect(result).toBe('This is the first sentence...');
    });

    it('handles multiple punctuation marks', () => {
      const text = 'This is the first sentence!? Yes, it is.';
      const result = extractTextToHighlight(text);
      expect(result).toBe('This is the first sentence!?');
    });

    it('handles commas within sentences', () => {
      const text =
        'This is the first sentence, which has a comma. This is the second.';
      const result = extractTextToHighlight(text);
      expect(result).toBe('This is the first sentence, which has a comma.');
    });
  });

  describe('generateTextFragmentUrl', () => {
    it('generates a text fragment URL with the correct encoding', () => {
      const uri = 'https://example.com';
      const text = 'This is a sample text.';
      const result = generateTextFragmentUrl(uri, text);
      expect(result).toBe(
        'https://example.com#:~:text=This%20is%20a%20sample%20text.'
      );
    });
  });
});
