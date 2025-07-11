import type {SearchParameters} from './search-parameter-actions.js';
import {buildSSRSearchParameterSerializer} from './search-parameter-serializer.ssr.js';

const someSpecialCharactersThatNeedsEncoding = [
  '&',
  ',',
  '=',
  '[',
  ']',
  '#',
  '?',
  '/',
  '>',
];

describe('buildSSRSearchParameterSerializer', () => {
  const {toSearchParameters} = buildSSRSearchParameterSerializer();

  describe('#toSearchParameters', () => {
    it('should convert URLSearchParams to SearchParameters', () => {
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append('q', 'query');
      urlSearchParams.append('f-color', 'red');
      urlSearchParams.append('f-shape', 'square');

      const result = toSearchParameters(urlSearchParams);

      expect(result).toEqual({
        q: 'query',
        f: {color: ['red'], shape: ['square']},
      });
    });

    it('should convert Record<string, SearchParamValue> to SearchParameters', () => {
      const searchParams = {
        q: 'query',
        'f-color': 'red',
        'f-shape': 'square',
      };

      const result = toSearchParameters(searchParams);

      expect(result).toEqual({
        q: 'query',
        f: {color: ['red'], shape: ['square']},
      });
    });

    it('should convert Record<string, SearchParamValue> with special characters to SearchParameters', () => {
      someSpecialCharactersThatNeedsEncoding.forEach((char) => {
        const searchParams = {
          q: `query${char}`,
          'f-color': 'red',
          'f-shape': 'square',
        };

        const result = toSearchParameters(searchParams);

        expect(result).toEqual({
          q: `query${char}`,
          f: {color: ['red'], shape: ['square']},
        });
      });
    });

    it('should not convert empty-string URLSearchParams to SearchParameters', () => {
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append('q', '');
      urlSearchParams.append('f-color', 'red');
      urlSearchParams.append('f-shape', 'square');

      const result = toSearchParameters(urlSearchParams);

      expect(result).toEqual({
        f: {color: ['red'], shape: ['square']},
      });
    });

    it('should cast the URLSearchParams to appropriate SearchParameter type', () => {
      const urlSearchParams = new URLSearchParams();
      urlSearchParams.append('firstResult', '10');
      urlSearchParams.append('debug', 'true');
      urlSearchParams.append('tab', 'all');

      const result = toSearchParameters(urlSearchParams);

      expect(result).toEqual({
        debug: true,
        firstResult: 10,
        tab: 'all',
      });
    });

    describe('when the search parameter have multiple values', () => {
      it('should convert repeated URL search parameters to a SearchParameters object', () => {
        const urlSearchParams = new URLSearchParams();
        urlSearchParams.append('q', 'query');
        urlSearchParams.append('f-color', 'red');
        urlSearchParams.append('f-color', 'green');
        urlSearchParams.append('f-shape', 'square');

        const result = toSearchParameters(urlSearchParams);

        expect(result).toEqual({
          q: 'query',
          f: {color: ['red', 'green'], shape: ['square']},
        });
      });

      it('should convert Record<string, SearchParamValue> with repeated values to a SearchParameters object', () => {
        const searchParams = {
          q: 'query',
          'f-color': ['red', 'green'],
          'f-shape': 'square',
        };

        const result = toSearchParameters(searchParams);

        expect(result).toEqual({
          q: 'query',
          f: {color: ['red', 'green'], shape: ['square']},
        });
      });

      it('should convert a URL search parameter with a single key and string value with special characters', () => {
        someSpecialCharactersThatNeedsEncoding.forEach((char) => {
          const {searchParams} = new URL(
            `https://example.com?q=hello${encodeURIComponent(char)}`
          );
          const result = toSearchParameters(searchParams);
          expect(result).toEqual({q: `hello${char}`});
        });
      });

      it('should convert two facets correctly with special characters', () => {
        someSpecialCharactersThatNeedsEncoding.forEach((char) => {
          const {searchParams} = new URL(
            `https://example.com?f-color=${encodeURIComponent(
              char
            )}&f-color=green&f-shape=square`
          );

          const result = toSearchParameters(searchParams);

          expect(result).toEqual({
            f: {
              color: [char, 'green'],
              shape: ['square'],
            },
          });
        });
      });
    });
  });

  describe('serialize', () => {
    const {serialize} = buildSSRSearchParameterSerializer();

    it('should serializes special characters in records', () => {
      const initialUrl = new URL('https://example.com');
      someSpecialCharactersThatNeedsEncoding.forEach((specialChar) => {
        const result = serialize({q: `hello${specialChar}`}, initialUrl);
        expect(result).toBe(
          `https://example.com/?q=hello${encodeURIComponent(specialChar)}`
        );
      });
    });

    it('serializes special characters in the #f parameter correctly', () => {
      const initialUrl = new URL('https://example.com');
      someSpecialCharactersThatNeedsEncoding.forEach((specialChar) => {
        const f = {author: ['a', specialChar]};
        const result = serialize({f}, initialUrl);
        expect(result).toEqual(
          `https://example.com/?f-author=a&f-author=${encodeURIComponent(
            specialChar
          )}`
        );
      });
    });

    it('should serialize search parameters to URL', () => {
      const searchParameters: SearchParameters = {
        q: 'query',
        f: {color: ['red', 'green'], shape: ['square']},
      };
      const initialUrl = new URL('https://example.com');

      const result = serialize(searchParameters, initialUrl);

      expect(result).toBe(
        'https://example.com/?q=query&f-color=red&f-color=green&f-shape=square'
      );
    });

    it('should serialize search parameters to URL regardless of their types', () => {
      const searchParameters: SearchParameters = {
        debug: true,
        firstResult: 10,
        tab: 'all',
      };
      const initialUrl = new URL('https://example.com');

      const result = serialize(searchParameters, initialUrl);

      expect(result).toBe(
        'https://example.com/?debug=true&firstResult=10&tab=all'
      );
    });

    it('should not alter url host and route', () => {
      const searchParameters: SearchParameters = {
        q: 'query',
        f: {color: ['red', 'green'], shape: ['square']},
      };
      const initialUrl = new URL('https://example.com/custom/route');

      const result = serialize(searchParameters, initialUrl);

      expect(result).toBe(
        'https://example.com/custom/route?q=query&f-color=red&f-color=green&f-shape=square'
      );
    });

    it('should not overwrite existing (non-coveo) search parameters in URL', () => {
      const searchParameters: SearchParameters = {
        f: {color: ['red', 'green'], shape: ['square']},
      };
      const initialUrl = new URL('https://example.com?foo=bar');

      const result = serialize(searchParameters, initialUrl);

      expect(result).toBe(
        'https://example.com/?foo=bar&f-color=red&f-color=green&f-shape=square'
      );
    });

    it('should overwrite existing coveo search parameters in URL', () => {
      const searchParameters = {
        f: {color: ['red', 'green'], shape: ['square']},
      };
      const initialUrl = new URL(
        'https://example.com/?f-color=blue&f-shape=oval'
      );

      const result = serialize(searchParameters, initialUrl);

      expect(result).toBe(
        'https://example.com/?f-color=red&f-color=green&f-shape=square'
      );
    });

    it('should handle empty search parameters', () => {
      const searchParameters = {};
      const initialUrl = new URL('https://example.com/?param1=value1');
      const result = serialize(searchParameters, initialUrl);

      expect(result).toBe('https://example.com/?param1=value1');
    });
  });
});
