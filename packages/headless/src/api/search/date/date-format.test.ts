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

  it('enforces the minimum Epoch date', () => {
    const date = -99999999999999;
    expect(formatDateForSearchApi(dayjs(date))).toBe(
      formatDateForSearchApi(dayjs(new Date(0, 0, 0)))
    );
  });
});
