import {generateFacetDependencyConditions} from 'c/quanticUtils';

describe('facet dependencies utils', () => {
  describe('generateFacetDependencyConditions', () => {
    test('throws error when depending on multiple facets', () => {
      expect(() =>
        generateFacetDependencyConditions({facet1: 'value1', facet2: 'value2'})
      ).toThrow("Depending on multiple facets isn't supported");
    });

    test('returns an array with a single GenericCondition', () => {
      const dependsOn = {facet1: 'value1'};
      const result = generateFacetDependencyConditions(dependsOn);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          parentFacetId: 'facet1',
          condition: expect.any(Function),
        })
      );
    });

    test('condition function returns true when expected value matches SimpleFacetValue', () => {
      const dependsOn = {facet1: 'value1'};
      const result = generateFacetDependencyConditions(dependsOn);
      const conditionFn = result[0].condition;

      const values = [{value: 'value1', state: 'selected'}];
      expect(conditionFn(values)).toBe(true);
    });

    test('condition function returns false when expected value does not match SimpleFacetValue', () => {
      const dependsOn = {facet1: 'value1'};
      const result = generateFacetDependencyConditions(dependsOn);
      const conditionFn = result[0].condition;

      const values = [{value: 'otherValue', state: 'selected'}];
      expect(conditionFn(values)).toBe(false);
    });

    test('condition function returns true when expected value matches selected CategoryFacetValue', () => {
      const dependsOn = {facet1: 'categoryValue'};
      const result = generateFacetDependencyConditions(dependsOn);
      const conditionFn = result[0].condition;

      const values = [
        {
          value: 'parent',
          state: 'not-selected',
          children: [{value: 'categoryValue', state: 'selected', children: []}],
        },
      ];

      expect(conditionFn(values)).toBe(true);
    });

    test('condition function returns false when CategoryFacetValue does not contain expected value', () => {
      const dependsOn = {facet1: 'nonMatchingValue'};
      const result = generateFacetDependencyConditions(dependsOn);
      const conditionFn = result[0].condition;

      const values = [
        {
          value: 'parent',
          state: 'not-selected',
          children: [{value: 'categoryValue', state: 'selected', children: []}],
        },
      ];

      expect(conditionFn(values)).toBe(false);
    });

    test('condition function returns false when CategoryFacetValue is not selected', () => {
      const dependsOn = {facet1: 'categoryValue'};
      const result = generateFacetDependencyConditions(dependsOn);
      const conditionFn = result[0].condition;

      const values = [
        {
          value: 'parent',
          state: 'not-selected',
          children: [
            {value: 'categoryValue', state: 'not-selected', children: []},
          ],
        },
      ];

      expect(conditionFn(values)).toBe(false);
    });
  });
});
