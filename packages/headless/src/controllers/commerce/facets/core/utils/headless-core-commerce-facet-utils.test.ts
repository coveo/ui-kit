import {
  buildMockCommerceCategoryFacetValue,
  buildMockCommerceDateFacetValue,
  buildMockCommerceNumericFacetValue,
  buildMockCommerceRegularFacetValue,
} from '../../../../../test/mock-commerce-facet-value';
import {FacetValueState} from '../../../../core/facets/facet/headless-core-facet';
import {FacetType} from '../headless-core-commerce-facet';
import {findIfHasActiveValues} from './headless-core-commerce-facet-utils';

describe('#findIfHasActiveValues', () => {
  describe('when the facet type is "category', () => {
    const type = 'hierarchical' as FacetType;
    it('when current value has ancestors, returns "true"', () => {
      const values = [
        buildMockCommerceCategoryFacetValue({
          value: 'A',
          path: ['A'],
          children: [
            buildMockCommerceCategoryFacetValue({
              value: 'B',
              path: ['A', 'B'],
              children: [
                buildMockCommerceCategoryFacetValue({
                  value: 'C',
                  path: ['A', 'B', 'C'],
                }),
                buildMockCommerceCategoryFacetValue({
                  value: 'D',
                  path: ['A', 'B', 'D'],
                  state: 'selected',
                }),
                buildMockCommerceCategoryFacetValue({
                  value: 'E',
                  path: ['A', 'B', 'E'],
                }),
              ],
            }),
          ],
        }),
      ];
      expect(findIfHasActiveValues(values, type)).toBe(true);
    });
    describe('when current value has no ancestors, returns "false"', () => {
      const values = [buildMockCommerceCategoryFacetValue()];
      expect(findIfHasActiveValues(values, type)).toBe(false);
    });
  });

  describe.each([
    {
      facetType: 'regular' as FacetType,
      mockFacetValueBuilder: buildMockCommerceRegularFacetValue,
    },
    {
      facetType: 'numerical' as FacetType,
      mockFacetValueBuilder: buildMockCommerceNumericFacetValue,
    },
    {
      facetType: 'date' as FacetType,
      mockFacetValueBuilder: buildMockCommerceDateFacetValue,
    },
  ])('when the facet type is "$type"', ({facetType, mockFacetValueBuilder}) => {
    describe.each([
      {state: 'idle' as FacetValueState, expected: false},
      {state: 'excluded' as FacetValueState, expected: true},
      {state: 'selected' as FacetValueState, expected: true},
    ])('when the #state of any value is "$state"', ({state, expected}) => {
      const values = [
        mockFacetValueBuilder(),
        mockFacetValueBuilder({state}),
        mockFacetValueBuilder(),
      ];
      it('returns "$expected"', () => {
        expect(findIfHasActiveValues(values, facetType)).toBe(expected);
      });
    });
  });
});
