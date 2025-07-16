import type {StaticFilterSection} from '../../state/state-sections.js';
import {selectStaticFilterExpressions} from './static-filter-set-selectors.js';

describe('static filter set expressions', () => {
  describe('getStaticFilterExpressions', () => {
    it('returns an empty array when there are no static filters', () => {
      const state = {
        staticFilterSet: {},
      };

      const result = selectStaticFilterExpressions(state);
      expect(result).toEqual([]);
    });

    it('returns an empty array when state is undefined', () => {
      const state = {
        staticFilterSet: undefined,
      };

      const result = selectStaticFilterExpressions(state);
      expect(result).toEqual([]);
    });

    it('returns an array with a single selected filter expressions', () => {
      const state: StaticFilterSection = {
        staticFilterSet: {
          youtube: {
            id: 'test-static-filter',
            values: [
              {
                caption: 'youtube',
                expression: '@filetype=="youtubevideo"',
                state: 'selected',
              },
            ],
          },
        },
      };

      const result = selectStaticFilterExpressions(state);
      expect(result).toEqual(['@filetype=="youtubevideo"']);
    });

    it('only returns selected filter expressions', () => {
      const state: StaticFilterSection = {
        staticFilterSet: {
          filters: {
            id: 'test-static-filter',
            values: [
              {
                caption: 'idle-filter',
                expression: '@filetype=="idle"',
                state: 'idle',
              },
              {
                caption: 'selected-filter',
                expression: '@filetype=="selected"',
                state: 'selected',
              },
              {
                caption: 'excluded-filter',
                expression: '@filetype=="excluded"',
                state: 'excluded',
              },
            ],
          },
        },
      };

      const result = selectStaticFilterExpressions(state);
      expect(result).toEqual(['@filetype=="selected"']);
    });

    it('concatenates multiple values with OR for a single filter', () => {
      const state: StaticFilterSection = {
        staticFilterSet: {
          dropbox: {
            id: 'test-static-filter',
            values: [
              {
                caption: 'dropbox',
                expression: '@filetype=="pdf"',
                state: 'selected',
              },
              {
                caption: 'youtube',
                expression: '@filetype=="youtubevideo"',
                state: 'selected',
              },
            ],
          },
        },
      };

      const result = selectStaticFilterExpressions(state);
      expect(result).toEqual([
        '(@filetype=="pdf" OR @filetype=="youtubevideo")',
      ]);
    });

    it('returns an array with multiple different selected filter expressions', () => {
      const state: StaticFilterSection = {
        staticFilterSet: {
          youtube: {
            id: 'test-static-filter',
            values: [
              {
                caption: 'youtube',
                expression: '@filetype=="youtubevideo"',
                state: 'selected',
              },
            ],
          },
          dropbox: {
            id: 'test-static-filter',
            values: [
              {
                caption: 'dropbox',
                expression: '@filetype=="pdf"',
                state: 'selected',
              },
            ],
          },
        },
      };

      const result = selectStaticFilterExpressions(state);
      expect(result).toEqual(['@filetype=="youtubevideo"', '@filetype=="pdf"']);
    });
  });
});
