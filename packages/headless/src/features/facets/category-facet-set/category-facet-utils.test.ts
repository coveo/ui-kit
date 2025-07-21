import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value.js';
import {findActiveValueAncestry} from './category-facet-utils.js';
import type {CategoryFacetValue} from './interfaces/response.js';

describe('#findActiveValueAncestry', () => {
  it("should return an empty array if there's no selected values", () => {
    expect(findActiveValueAncestry([])).toEqual([]);
  });

  describe('when there is a value selected', () => {
    const selectedValue = buildMockCategoryFacetValue({
      state: 'selected',
      value: 'A',
    });
    const notAncestorValue = buildMockCategoryFacetValue();

    const buildAncestor = (children: CategoryFacetValue[]) => {
      return buildMockCategoryFacetValue({children});
    };

    const hierarchicalTestCases = [
      () => [notAncestorValue, buildAncestor([selectedValue])],
      () => [buildAncestor([notAncestorValue, selectedValue])],
      () => [
        buildAncestor([
          notAncestorValue,
          buildAncestor([selectedValue, notAncestorValue]),
        ]),
      ],
    ];

    it('should return an array containing only the selected Value if the selected value is at the root', () => {
      expect(findActiveValueAncestry([selectedValue])).toEqual([selectedValue]);
    });

    it.each(hierarchicalTestCases)(
      'should return an array containing the selected value whole ancestry',
      (generateValues) => {
        expect(findActiveValueAncestry(generateValues())).not.toContain(
          notAncestorValue
        );
      }
    );

    it.each(hierarchicalTestCases)(
      'should return an array containing the ancestors in order, from the root to the selected value',
      (generateValue) => {
        const ancestry = findActiveValueAncestry(generateValue());

        expect(ancestry.pop()).toBe(selectedValue);
        expect(ancestry[ancestry.length - 1].children).toContain(selectedValue);
        for (let i = 0; i < ancestry.length - 2; i++) {
          expect(ancestry[i].children).toContain(ancestry[i + 1]);
        }
      }
    );
  });
});
