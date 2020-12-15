import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {buildDateRange} from './date-range';

describe('date-range', () => {
  it('#buildDateRange generates the correct value for a numeric input', () => {
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

  it('#buildDateRange generates the correct value for a js date input', () => {
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

  it('#buildDateRange generates the correct value for an iso 8601 string input', () => {
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

  it('#buildDateRange throws if the date can not be parsed', () => {
    expect(() =>
      buildDateRange({
        start: 'NOT A DATE',
        end: 'NOT A DATE',
      })
    ).toThrow(
      `Could not parse the provided date, please provide a dateFormat string in the configuration options.\n
       See https://day.js.org/docs/en/parse/string-format for more information.
       `
    );
  });

  it('#buildDateRange uses provided date format string', () => {
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
