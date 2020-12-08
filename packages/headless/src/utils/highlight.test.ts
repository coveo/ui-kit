import {
  HighlightKeyword,
  highlightString,
  HighlightParams,
  getHighlightedSuggestions,
  SuggestionHighlightingOptions,
} from './highlight';

describe('highlight', () => {
  describe('highlightString', () => {
    const highlights: HighlightKeyword[] = [
      {offset: 3, length: 5},
      {offset: 10, length: 4},
      {offset: 18, length: 15},
      {offset: 45, length: 10},
    ];
    const highlightParams: HighlightParams = {
      content:
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut',
      highlights: highlights,
      openingDelimiter: '<span>',
      closingDelimiter: '</span>',
    };

    it('should wrap the passed highlights with tags using the specified class name', () => {
      const expectedHighlight =
        'Lor<span>em ip</span>su<span>m do</span>lor <span>sit amet, conse</span>ctetur adipi<span>sicing eli</span>t, sed do eiusmod tempor incididunt ut';
      expect(highlightString(highlightParams)).toBe(expectedHighlight);
    });

    it('should return the string unchanged if "content" is an empty string', () => {
      const expectedString = '';
      expect(highlightString({...highlightParams, content: ''})).toBe(
        expectedString
      );
    });

    it('should throw if "tag" is an empty string', () => {
      expect(() =>
        highlightString({...highlightParams, openingDelimiter: ''})
      ).toThrow('delimiters should be a non-empty string');
    });
  });

  describe('formatHighlightedSuggestion', () => {
    let suggestion: string;
    beforeEach(() => {
      suggestion = '[thi]{s} [i]{s} (high)[light]{ed}';
    });

    it('should highlight only not match', () => {
      const options: SuggestionHighlightingOptions = {
        notMatchDelimiters: {
          open: '<i>',
          close: '</i>',
        },
      };
      const formatted = getHighlightedSuggestions(suggestion, options);
      const expected = '<i>thi</i>s <i>i</i>s high<i>light</i>ed';
      expect(formatted).toEqual(expected);
    });

    it('should highlight only exact match', () => {
      const options: SuggestionHighlightingOptions = {
        exactMatchDelimiters: {
          open: '<i>',
          close: '</i>',
        },
      };
      const formatted = getHighlightedSuggestions(suggestion, options);
      const expected = 'thi<i>s</i> i<i>s</i> highlight<i>ed</i>';
      expect(formatted).toEqual(expected);
    });

    it('should highlight only correction', () => {
      const options: SuggestionHighlightingOptions = {
        correctionDelimiters: {
          open: '<i>',
          close: '</i>',
        },
      };
      const formatted = getHighlightedSuggestions(suggestion, options);
      const expected = 'this is <i>high</i>lighted';
      expect(formatted).toEqual(expected);
    });

    it('should highlight correctly', () => {
      const options: SuggestionHighlightingOptions = {
        notMatchDelimiters: {
          open: 'open',
          close: 'close',
        },
        exactMatchDelimiters: {
          open: '<strong>',
          close: '</strong>',
        },
        correctionDelimiters: {
          open: '<i>',
          close: '</i>',
        },
      };
      const formatted = getHighlightedSuggestions(suggestion, options);
      const expected =
        'openthiclose<strong>s</strong> openiclose<strong>s</strong> <i>high</i>openlightclose<strong>ed</strong>';
      expect(formatted).toEqual(expected);
    });
  });
});
