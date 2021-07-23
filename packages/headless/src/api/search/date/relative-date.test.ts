import {isSearchApiDate} from './date-format';
import {
  deserializeRelativeDate,
  RelativeDate,
  serializeRelativeDate,
  isRelativeDate,
  RelativeDatePeriod,
  isRelativeDateFormat,
  formatRelativeDateForSearchApi,
} from './relative-date';

describe('#deserializeRelativeDate', () => {
  it('parses "now"', () => {
    const expected: RelativeDate = {period: 'now'};
    expect(deserializeRelativeDate('now')).toEqual(expected);
  });

  it('parses "next-100-quarter"', () => {
    const expected: RelativeDate = {
      period: 'next',
      amount: 100,
      unit: 'quarter',
    };
    expect(deserializeRelativeDate('next-100-quarter')).toEqual(expected);
  });
});

describe('#serializeRelativeDate', () => {
  it('when putting a bad format, should throw', () => {
    expect(() =>
      serializeRelativeDate({period: 'nononono' as RelativeDatePeriod})
    ).toThrow();
  });

  it('formats to "now"', () => {
    expect(serializeRelativeDate({period: 'now'})).toEqual('now');
  });

  it('formats to "next-100-quarter"', () => {
    expect(
      serializeRelativeDate({
        period: 'next',
        amount: 100,
        unit: 'quarter',
      })
    ).toEqual('next-100-quarter');
  });
});

describe('#isRelativeDate', () => {
  it('when using with a string, returns false', () =>
    expect(isRelativeDate('hello')).toBe(false));

  it('when using with a Date, returns false', () =>
    expect(isRelativeDate(new Date())).toBe(false));

  it('when using with a number, returns false', () =>
    expect(isRelativeDate(242324324)).toBe(false));

  it('when using with an object without period, returns false', () =>
    expect(isRelativeDate({hello: 'test'})).toBe(false));

  it('when using with an object with period, returns true', () =>
    expect(isRelativeDate({period: 'past', amount: 2, unit: 'week'})).toBe(
      true
    ));
});

describe('#formatRelativeDateForSearchApi', () => {
  it('returns an valid API date value', () =>
    expect(
      isSearchApiDate(formatRelativeDateForSearchApi('next-100-quarter'))
    ).toBe(true));
});

describe('#isRelativeDateFormat', () => {
  it('returns true on a valid format', () =>
    expect(isRelativeDateFormat('next-100-quarter')).toBe(true));

  it('returns false on a incomplete format', () =>
    expect(isRelativeDateFormat('next-100')).toBe(false));

  it('returns false on a wrong period', () =>
    expect(isRelativeDateFormat('previous-2-day')).toBe(false));

  it('returns false on a wrong unit', () =>
    expect(isRelativeDateFormat('past-2-dog')).toBe(false));

  it('returns false on an invalid format', () =>
    expect(isRelativeDateFormat('2018/01/01@00:00:00')).toBe(false));
});
