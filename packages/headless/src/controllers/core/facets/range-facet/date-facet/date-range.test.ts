import {describe, expect, it} from 'vitest';
import {
  formatDateForSearchApi,
  parseDate,
} from '../../../../../api/search/date/date-format.js';
import {
  type RelativeDate,
  serializeRelativeDate,
} from '../../../../../api/search/date/relative-date.js';
import type {DateRangeRequest} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/request.js';
import {buildDateRange} from './date-range.js';

describe('date range', () => {
  describe('#buildDateRange', () => {
    function validateAbsoluteRange(
      start: string | number | Date,
      end: string | number | Date
    ) {
      const dateRange = buildDateRange({
        start,
        end,
      });

      const expectedValues: DateRangeRequest = {
        start: formatDateForSearchApi(parseDate(start)),
        end: formatDateForSearchApi(parseDate(end)),
        endInclusive: false,
        state: 'idle',
      };

      expect(dateRange).toEqual(expectedValues);
    }
    it('generates the correct value for a numeric input', () => {
      validateAbsoluteRange(721386625000, 752922625000);
    });

    it('generates the correct value for a js date input', () => {
      validateAbsoluteRange(new Date(721386625000), new Date(752922625000));
    });

    it('generates the correct value for an iso 8601 string input', () => {
      validateAbsoluteRange(
        new Date(721386625000).toISOString(),
        new Date(752922625000).toISOString()
      );
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
