import {SearchParameters} from './search-parameter-actions';
import {buildSSRSearchParameterSerializer} from './search-parameter-serializer.ssr';

describe('buildSSRSearchParameterSerializer', () => {
  const {toSearchParameters} = buildSSRSearchParameterSerializer();

  describe('when the search parameter value is a string', () => {
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
  });

  describe('when the search parameter value is repeated', () => {
    it('should convert URLSearchParams to SearchParameters', () => {
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

    it('should convert Record<string, SearchParamValue> to SearchParameters', () => {
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
  });
});

describe('serializeSearchParametersToUrl', () => {
  const {serializeSearchParametersToUrl} = buildSSRSearchParameterSerializer();

  it('should serialize search parameters to URL', () => {
    const searchParameters: SearchParameters = {
      q: 'query',
      f: {color: ['red', 'green'], shape: ['square']},
    };
    const initialUrl = new URL('https://example.com');

    const result = serializeSearchParametersToUrl(searchParameters, initialUrl);

    expect(result).toBe(
      'https://example.com/?q=query&f-color=red&f-color=green&f-shape=square'
    );
  });

  it('should not overwrite existing (non-coveo) search parameters in URL', () => {
    const searchParameters: SearchParameters = {
      f: {color: ['red', 'green'], shape: ['square']},
    };
    const initialUrl = new URL('https://example.com?foo=bar');

    const result = serializeSearchParametersToUrl(searchParameters, initialUrl);

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

    const result = serializeSearchParametersToUrl(searchParameters, initialUrl);

    expect(result).toBe(
      'https://example.com/?f-color=red&f-color=green&f-shape=square'
    );
  });

  it('should handle empty search parameters', () => {
    const searchParameters = {};
    const initialUrl = new URL('https://example.com/?param1=value1');
    const result = serializeSearchParametersToUrl(searchParameters, initialUrl);

    expect(result).toBe('https://example.com/?param1=value1');
  });
});
