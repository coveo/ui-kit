import {
  escapeHtml,
  getHighlightedSuggestion,
  type HighlightKeyword,
  type HighlightParams,
  highlightString,
  type SuggestionHighlightingOptions,
} from './highlight.js';

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
        /* cspell:disable-next-line */
        'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut',
      highlights: highlights,
      openingDelimiter: '<span>',
      closingDelimiter: '</span>',
    };

    it('should wrap the passed highlights with tags using the specified class name', () => {
      const expectedHighlight =
        /* cspell:disable-next-line */
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
        highlightString({
          ...highlightParams,
          openingDelimiter: '',
        })
      ).toThrow('delimiters should be a non-empty string');
    });

    it('should escape the string and return correctly highlighted string', () => {
      const testCases = [
        {
          input: 'malicious <script/> string',
          /* cspell:disable-next-line */
          output: 'mal<span>iciou</span>s &lt;script/&gt; <span>str</span>ing',
          highlights: [
            {offset: 3, length: 5},
            {offset: 20, length: 3},
          ],
        },
        {
          input: '<p>Chat test for SFCT 809</p>',
          output:
            '&lt;p&gt;<span>Chat</span> <span>test</span> <span>for</span> <span>SFCT</span> <span>809</span>&lt;/p&gt;',
          highlights: [
            {length: 4, offset: 3},
            {length: 4, offset: 8},
            {length: 3, offset: 13},
            {length: 4, offset: 17},
            {length: 3, offset: 22},
          ],
        },
      ];

      testCases.forEach(({highlights, input, output}) => {
        expect(
          highlightString({
            ...highlightParams,
            highlights,
            content: input,
          })
        ).toBe(output);
      });
    });

    it('should escape the string when there is nothing to highlight', () => {
      const str = 'malicious <script/> string';
      const newHighlights: HighlightKeyword[] = [];

      const expectedString = 'malicious &lt;script/&gt; string';

      expect(
        highlightString({
          ...highlightParams,
          highlights: newHighlights,
          content: str,
        })
      ).toBe(expectedString);
    });
  });

  describe('getHighlightedSuggestion', () => {
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
      const formatted = getHighlightedSuggestion(suggestion, options);
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
      const formatted = getHighlightedSuggestion(suggestion, options);
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
      const formatted = getHighlightedSuggestion(suggestion, options);
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
      const formatted = getHighlightedSuggestion(suggestion, options);
      const expected =
        /* cspell:disable-next-line */
        'openthiclose<strong>s</strong> openiclose<strong>s</strong> <i>high</i>openlightclose<strong>ed</strong>';
      expect(formatted).toEqual(expected);
    });

    it('should not highlight if the delimiters object is empty', () => {
      const formatted = getHighlightedSuggestion(suggestion, {});
      const expected = 'this is highlighted';
      expect(formatted).toEqual(expected);
    });
  });

  describe('escape', () => {
    it('should replace special characters', () => {
      /* cspell:disable-next-line */
      expect(escapeHtml("an'es'caped&<str&>ing`\"`")).toBe(
        /* cspell:disable-next-line */
        'an&#x27;es&#x27;caped&amp;&lt;str&amp;&gt;ing&#x60;&quot;&#x60;'
      );
      /* cspell:disable-next-line */
      expect(escapeHtml("constante d'acidité")).toBe(
        'constante d&#x27;acidité'
      );
    });
  });
});
