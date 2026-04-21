import {getSortCriteria} from './parameter-manager-selectors.js';

describe('getSortCriteria', () => {
  describe('when the section is undefined', () => {
    it('returns an empty object', () => {
      expect(getSortCriteria(undefined, (s: never) => s, 'relevancy')).toEqual(
        {}
      );
    });
  });

  describe('with primitive (string) sort values', () => {
    it('returns {} when the sort criteria equals the initial state', () => {
      const section = {sortCriteria: 'relevancy'};
      expect(
        getSortCriteria(section, (s) => s.sortCriteria, 'relevancy')
      ).toEqual({});
    });

    it('returns {sortCriteria} when the sort criteria differs from the initial state', () => {
      const section = {sortCriteria: 'date descending'};
      expect(
        getSortCriteria(section, (s) => s.sortCriteria, 'relevancy')
      ).toEqual({sortCriteria: 'date descending'});
    });
  });

  describe('with object sort values (commerce sort criterion)', () => {
    it('returns {} when the sort criteria object is deeply equal to the initial state', () => {
      const appliedSort = {by: 'relevance'};
      const initialSort = {by: 'relevance'};

      expect(
        getSortCriteria({appliedSort}, (s) => s.appliedSort, initialSort)
      ).toEqual({});
    });

    it('returns {sortCriteria} when the sort criteria object differs from the initial state', () => {
      const appliedSort = {
        by: 'fields',
        fields: [{name: 'price', direction: 'asc'}],
      };
      const initialSort = {by: 'relevance'};

      expect(
        getSortCriteria({appliedSort}, (s) => s.appliedSort, initialSort)
      ).toEqual({sortCriteria: appliedSort});
    });
  });
});
