import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {validateManualDateRanges} from './date-facet-actions';

describe('validateManualDateRanges', () => {
  it('should not throw when the start is lower or equal than the end', () => {
    expect(() =>
      validateManualDateRanges({
        currentValues: [
          buildMockDateFacetValue({
            start: '2021/01/01@00:00:00',
            end: '2021/01/01@00:00:00',
          }),
          buildMockDateFacetValue({
            start: '2021/01/01@00:00:00',
            end: '2021/01/02@00:00:00',
          }),
        ],
      })
    ).not.toThrow();
  });

  it('should throw when the start is greater than the end', () => {
    expect(() =>
      validateManualDateRanges({
        currentValues: [
          buildMockDateFacetValue({
            start: '2021/01/02@00:00:00',
            end: '2021/01/01@00:00:00',
          }),
        ],
      })
    ).toThrow(
      'The start value is greater than the end value for the date range 2021/01/02@00:00:00 to 2021/01/01@00:00:00'
    );
  });

  it('should throw when the start value is not set (start becomes current date)', () => {
    expect(() =>
      validateManualDateRanges({
        currentValues: [
          buildMockDateFacetValue({
            start: new Date().toDateString(),
            end: '2021/01/01@00:00:00',
          }),
        ],
      })
    ).toThrow(
      'The date range with end value 2021/01/01@00:00:00 has no start value'
    );
  });

  it('should throw when the start or the end is invalid', () => {
    expect(() =>
      validateManualDateRanges({
        currentValues: [
          buildMockDateFacetValue({
            start: 'thisisnotadate',
            end: '2021/01/01@00:00:00',
          }),
          buildMockDateFacetValue({
            start: '2021/01/01@00:00:00',
            end: 'thisisnotadate',
          }),
        ],
      })
    ).toThrow();
  });
});
