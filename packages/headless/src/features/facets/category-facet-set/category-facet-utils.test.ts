import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {getActiveValueFromValueTree} from './category-facet-utils';
import {CategoryFacetValue} from './interfaces/response';

describe('#getActiveValueFromValueTree', () => {
  it("should return undefined if there's no selected values", () => {
    expect(getActiveValueFromValueTree([])).toBeUndefined();
  });

  it.each([
    {
      caseName: 'doubleRootValues',
      getValues: (expectedValue: CategoryFacetValue) => [
        expectedValue,
        buildMockCategoryFacetValue({state: 'selected'}),
      ],
    },
    {
      caseName: 'rootAndNestedValues',
      getValues: (expectedValue: CategoryFacetValue) => [
        buildMockCategoryFacetValue({children: [expectedValue]}),
        buildMockCategoryFacetValue({state: 'selected'}),
      ],
    },
    {
      caseName: 'doubleNestedValues',
      getValues: (expectedValue: CategoryFacetValue) => [
        buildMockCategoryFacetValue({children: [expectedValue]}),
        buildMockCategoryFacetValue({
          children: [buildMockCategoryFacetValue({state: 'selected'})],
        }),
      ],
    },
    {
      caseName: 'singleNestedValue',
      getValues: (expectedValue: CategoryFacetValue) => [
        buildMockCategoryFacetValue({children: [expectedValue]}),
      ],
    },
    {
      caseName: 'singleRootValue',
      getValues: (expectedValue: CategoryFacetValue) => [expectedValue],
    },
  ])(
    'should return the first selected values found while doing a depth first search - $caseName',
    ({getValues}) => {
      const expectedValues = buildMockCategoryFacetValue({
        state: 'selected',
        value: 'A',
      });

      const values: CategoryFacetValue[] = getValues(expectedValues);

      expect(getActiveValueFromValueTree(values)).toBe(expectedValues);
    }
  );
});
