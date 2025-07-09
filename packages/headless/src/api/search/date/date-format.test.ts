import {
  formatDateForSearchApi,
  isSearchApiDate,
  parseDate,
  validateAbsoluteDate,
} from './date-format.js';

describe('#parseDate', () => {
  it('can parse the search API format', () => {
    expect(parseDate('2022/08/23@17:42:55').toDate().toUTCString()).toEqual(
      new Date('2022-08-23T17:42:55').toUTCString()
    );
  });

  it('parses the date in the current timezone by default', () => {
    expect(parseDate('2022-08-23T17:42:55').toDate().toUTCString()).toEqual(
      new Date('2022-08-23T17:42:55+08:45').toUTCString()
    );
    vi.resetAllMocks();
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

describe('#formatDateForSearchApi', () => {
  it('returns the correct format', () => {
    const date = 818035920000;
    expect(formatDateForSearchApi(parseDate(date))).toBe(
      parseDate(date).format('YYYY/MM/DD@HH:mm:ss')
    );
  });
});

describe('#validateAbsoluteDate', () => {
  it('should not throw for a valid date', () => {
    expect(() => validateAbsoluteDate(Date.now())).not.toThrow();
  });

  it('should throw for an invalid date', () => {
    expect(() => validateAbsoluteDate('hi')).toThrowError(
      'Could not parse the provided date'
    );
  });

  it('should throw for a valid date earlier than 1401', () => {
    expect(() => validateAbsoluteDate(new Date(1111, 11, 11))).toThrowError(
      'Date is before year 1401, which is unsupported by the API'
    );
  });
});
