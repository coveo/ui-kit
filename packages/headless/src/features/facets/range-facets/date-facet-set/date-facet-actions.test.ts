import {buildDateRange} from '../../../../controllers/facets/range-facet/date-facet/headless-date-facet.js';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value.js';
import {validateManualDateRanges} from './date-facet-actions.js';

describe('validateManualDateRanges', () => {
  it('should not throw when the start is lower or equal than the end', () => {
    expect(() =>
      validateManualDateRanges({
        currentValues: [
          buildMockDateFacetValue({
            start: '2021/01/01@00:00:00',
            end: '2021/01/01@00:00:00',
          }),
          buildMockDateFacetValue(
            buildDateRange({
              start: {period: 'past', amount: 2, unit: 'week'},
              end: {period: 'now'},
            })
          ),
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

  it('should throw when the start is greater than the end, with a relative range', () => {
    expect(() =>
      validateManualDateRanges({
        currentValues: [
          buildMockDateFacetValue(
            buildDateRange({
              start: {period: 'now'},
              end: {period: 'past', amount: 2, unit: 'week'},
            })
          ),
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
        ],
      })
    ).toThrow();
  });
});
