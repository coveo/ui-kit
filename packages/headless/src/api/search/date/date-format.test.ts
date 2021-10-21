import dayjs from 'dayjs';
import {
  isSearchApiDate,
  formatDateForSearchApi,
  validateAbsoluteDate,
} from './date-format';

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
    expect(formatDateForSearchApi(dayjs(date))).toBe(
      dayjs(date).format('YYYY/MM/DD@HH:mm:ss')
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
