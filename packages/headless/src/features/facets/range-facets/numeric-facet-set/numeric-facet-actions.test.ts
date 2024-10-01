import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value.js';
import {validateManualNumericRanges} from './numeric-facet-actions.js';

describe('validateManualNumericRanges', () => {
  it('should not throw when the start is lower or equal than the end', () => {
    expect(() =>
      validateManualNumericRanges({
        currentValues: [
          buildMockNumericFacetValue({
            start: 10,
            end: 10,
          }),
          buildMockNumericFacetValue({
            start: 1,
            end: 100,
          }),
        ],
      })
    ).not.toThrow();
  });

  it('should throw when the start is greater than the end', () => {
    expect(() =>
      validateManualNumericRanges({
        currentValues: [
          buildMockNumericFacetValue({
            start: 11,
            end: 10,
          }),
        ],
      })
    ).toThrow();
  });
});
