import {
  RelativeDate,
  serializeRelativeDate,
} from '../../../../api/search/date/relative-date';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {buildDateRange} from './date-range';

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

    it('generates the correct value for an relative date object', () => {
      const start: RelativeDate = {period: 'past', amount: 2, unit: 'week'};
      const end: RelativeDate = {period: 'now'};
      const dateRange = buildDateRange({
        start,
        end,
      });

      const expectedValues: DateRangeRequest = {
        start: serializeRelativeDate(start),
        end: serializeRelativeDate(end),
        endInclusive: false,
        state: 'idle',
      };

      expect(dateRange).toEqual(expectedValues);
    });

    it('generates the correct value for a relative date string', () => {
      const start = serializeRelativeDate({
        period: 'past',
        amount: 2,
        unit: 'week',
      });
      const end = serializeRelativeDate({period: 'now'});
      const dateRange = buildDateRange({
        start,
        end,
      });

      const expectedValues: DateRangeRequest = {
        start,
        end,
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
});
