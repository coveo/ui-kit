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
    ).toThrow();
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
