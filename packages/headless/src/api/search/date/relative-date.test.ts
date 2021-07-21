import {isSearchApiDate} from './date-format';
import {
  parseRelativeDate,
  RelativeDate,
  formatRelativeDate,
  isRelativeDate,
  RelativeDatePeriod,
  isRelativeDateFormat,
  formatRelativeDateForSearchApi,
} from './relative-date';

describe('#parseRelativeDate', () => {
  it('parses "now"', () => {
    const expected: RelativeDate = {period: 'now', useLocalTime: true};
    expect(parseRelativeDate('now')).toEqual(expected);
  });

  it('parses "nowutc"', () => {
    const expected: RelativeDate = {period: 'now', useLocalTime: false};
    expect(parseRelativeDate('nowutc')).toEqual(expected);
  });

  it('parses "future100quarter"', () => {
    const expected: RelativeDate = {
      period: 'future',
      useLocalTime: true,
      amount: 100,
      unit: 'quarter',
    };
    expect(parseRelativeDate('future100quarter')).toEqual(expected);
  });

  it('parses "past3Weekutc"', () => {
    const expected: RelativeDate = {
      period: 'past',
      useLocalTime: false,
      amount: 3,
      unit: 'week',
    };
    expect(parseRelativeDate('past3Weekutc')).toEqual(expected);
  });
});

describe('#formatRelativeDate', () => {
  it('when putting a bad format, should throw', () => {
    expect(() =>
      formatRelativeDate({period: 'nononono' as RelativeDatePeriod})
    ).toThrow();
  });

  it('formats to "now"', () => {
    expect(formatRelativeDate({period: 'now', useLocalTime: true})).toEqual(
      'now'
    );
  });

  it('formats to "nowutc"', () => {
    expect(formatRelativeDate({period: 'now', useLocalTime: false})).toEqual(
      'nowutc'
    );
  });

  it('formats to "future100quarter"', () => {
    expect(
      formatRelativeDate({
        period: 'future',
        useLocalTime: true,
        amount: 100,
        unit: 'quarter',
      })
    ).toEqual('future100quarter');
  });

  it('formats to "past3weekutc"', () => {
    expect(
      formatRelativeDate({
        period: 'past',
        useLocalTime: false,
        amount: 3,
        unit: 'week',
      })
    ).toEqual('past3weekutc');
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
      isSearchApiDate(formatRelativeDateForSearchApi('future100quarter'))
    ).toBe(true));
});

describe('#isRelativeDateFormat', () => {
  it('returns true on a valid format', () =>
    expect(isRelativeDateFormat('future100quarter')).toBe(true));

  it('returns false on a valid format', () =>
    expect(isRelativeDateFormat('2018/01/01@00:00:00')).toBe(false));
});
