import dayjs from 'dayjs';
import {isSearchApiDate, formatDateForSearchApi} from './date-format';

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

  it('when date is under the API/Index minimum, it should throw', () => {
    expect(() =>
      formatDateForSearchApi(dayjs().subtract(1000, 'year'))
    ).toThrow('Date is before year 1401, which is unsupported by the index.');
  });

  it('throws when dayjs value is not valid', () => {
    expect(() =>
      formatDateForSearchApi(dayjs().subtract(1000000, 'year'))
    ).toThrow('Date object is invalid.');
  });
});
