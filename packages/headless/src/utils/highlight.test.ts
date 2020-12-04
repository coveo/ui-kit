import {
  HighlightKeyword,
  highlightString,
  HighlightParams,
  formatHighlightedSuggestion,
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
    let highlightedSuggestion: string;
    beforeEach(() => {
      highlightedSuggestion = '[thi]{s} [i]{s} (high)[light]{ed}';
    });
    it('should format a highlighted string correctly', () => {
      const formatted = formatHighlightedSuggestion(
        highlightedSuggestion,
        '<strong>',
        '</strong>',
        '<i>',
        '</i>'
      );
      const expected =
        'thi<strong>s</strong> i<strong>s</strong> <i>high</i>light<strong>ed</strong>';
      expect(formatted).toEqual(expected);
    });

    it('should throw if any delimiter is an empty string', () => {
      expect(() =>
        formatHighlightedSuggestion(
          highlightedSuggestion,
          '',
          '</strong>',
          '<i>',
          '</i>'
        )
      ).toThrow('delimiters should be a non-empty string');
      expect(() =>
        formatHighlightedSuggestion(
          highlightedSuggestion,
          '<strong>',
          '',
          '<i>',
          '</i>'
        )
      ).toThrow('delimiters should be a non-empty string');
      expect(() =>
        formatHighlightedSuggestion(
          highlightedSuggestion,
          '<strong>',
          '</strong>',
          '',
          '</i>'
        )
      ).toThrow('delimiters should be a non-empty string');
      expect(() =>
        formatHighlightedSuggestion(
          highlightedSuggestion,
          '<strong>',
          '</strong>',
          '<i>',
          ''
        )
      ).toThrow('delimiters should be a non-empty string');
    });
  });
});
