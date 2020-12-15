import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {buildDateRange, isSearchApiDate} from './date-range';

describe('date range', () => {
  describe('#buildDateRange', () => {
    it('generates the correct value for a numeric input', () => {
      const dateRange = buildDateRange({
        start: 721386625000,
        end: 752922625000,
      });

      const expectedValues: DateRangeRequest = {
        start: '1992/11/10@09:10:25',
        end: '1993/11/10@09:10:25',
        endInclusive: false,
        state: 'idle',
      };

      expect(dateRange).toEqual(expectedValues);
    });

    it('generates the correct value for a js date input', () => {
      const dateRange = buildDateRange({
        start: new Date(721386625000),
        end: new Date(752922625000),
      });

      const expectedValues: DateRangeRequest = {
        start: '1992/11/10@09:10:25',
        end: '1993/11/10@09:10:25',
        endInclusive: false,
        state: 'idle',
      };

      expect(dateRange).toEqual(expectedValues);
    });

    it('generates the correct value for an iso 8601 string input', () => {
      const dateRange = buildDateRange({
        start: new Date(721386625000).toISOString(),
        end: new Date(752922625000).toISOString(),
      });

      const expectedValues: DateRangeRequest = {
        start: '1992/11/10@09:10:25',
        end: '1993/11/10@09:10:25',
        endInclusive: false,
        state: 'idle',
      };

      expect(dateRange).toEqual(expectedValues);
    });

    it('throws if the date can not be parsed', () => {
      expect(() =>
        buildDateRange({
          start: 'NOT A DATE',
          end: 'NOT A DATE',
        })
      ).toThrow();
    });

    it('uses provided date format string', () => {
      const dateFormat = 'MM-YYYY-DD@HH:mm:ss';
      const dateRange = buildDateRange({
        start: '11-1992-10@09:10:25',
        end: '11-1993-10@09:10:25',
        dateFormat,
        useLocalTime: true,
      });

      const expectedValues: DateRangeRequest = {
        start: '1992/11/10@09:10:25',
        end: '1993/11/10@09:10:25',
        endInclusive: false,
        state: 'idle',
      };
      expect(dateRange).toEqual(expectedValues);
    });
  });

  describe('#isSearchApiDate', () => {
    it('when the string matches the search api format, it returns true', () => {
      expect(isSearchApiDate('2010/01/01@05:00:00')).toBe(true);
    });

    it('when the string does not match the search api format, it returns false', () => {
      expect(isSearchApiDate('10/01/01@05:00:00')).toBe(false);
    });
  });
});
