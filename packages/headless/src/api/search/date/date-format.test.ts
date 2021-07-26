import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {isSearchApiDate, formatDateForSearchApi} from './date-format';

dayjs.extend(utc);

describe('#isSearchApiDate', () => {
  it('when the string matches the search api format, it returns true', () => {
    expect(isSearchApiDate('2010/01/01@05:00:00')).toBe(true);
  });

  it('when the string does not match the search api format, it returns false', () => {
    expect(isSearchApiDate('10/01/01@05:00:00')).toBe(false);
  });
});

it('formatDateForSearchApi returns the correct format', () => {
  expect(formatDateForSearchApi(dayjs(818035920000).utc())).toBe(
    '1995/12/04@00:12:00'
  );
});
