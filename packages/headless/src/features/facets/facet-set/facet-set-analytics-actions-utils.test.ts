import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {buildMockDateFacetRequest} from '../../../test/mock-date-facet-request';
import {buildMockDateFacetResponse} from '../../../test/mock-date-facet-response';
import {buildMockDateFacetValue} from '../../../test/mock-date-facet-value';
import {buildMockFacetRequest} from '../../../test/mock-facet-request';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockNumericFacetRequest} from '../../../test/mock-numeric-facet-request';
import {buildMockNumericFacetResponse} from '../../../test/mock-numeric-facet-response';
import {buildMockNumericFacetValue} from '../../../test/mock-numeric-facet-value';
import {createMockState} from '../../../test/mock-state';
import {
  buildFacetSelectionChangeMetadata,
  buildFacetStateMetadata,
} from './facet-set-analytics-actions-utils';

describe('facet-set-analytics-action-utils', () => {
  describe('#buildFacetStateMetadata & #buildFacetSelectionChangeMetadata', () => {
    describe('#specific facet', () => {
      const facetId = 'myfacet';
      const field = 'myfield';
      const getState = () => {
        const state = createMockState();
        const facetResponse = buildMockFacetResponse({
          facetId,
          field,
          values: [
            {numberOfResults: 1, value: 'should not appear', state: 'idle'},
            {numberOfResults: 1, value: 'should appear', state: 'selected'},
          ],
        });
        state.search.response.facets = [facetResponse];
        state.facetSet = {
          [facetResponse.facetId]: buildMockFacetRequest({facetId, field}),
        };
        return {state, facetResponse};
      };

      it('includes #selected values in the facet state', () => {
        const {state, facetResponse} = getState();
        expect(buildFacetStateMetadata(state)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: facetResponse.field,
              id: facetResponse.facetId,
              value: facetResponse.values[1].value,
              valuePosition: 2,
              displayValue: facetResponse.values[1].value,
              facetType: 'specific',
              state: 'selected',
              facetPosition: 1,
              title: `${facetResponse.field}_${facetResponse.facetId}`,
            }),
          ])
        );
      });

      it('does not include #idle values in the facet state', () => {
        const {state, facetResponse} = getState();

        expect(buildFacetStateMetadata(state)).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: facetResponse.values[0].value,
            }),
          ])
        );
      });

      it('should include the correct metadata', () => {
        const {state, facetResponse} = getState();
        const facetValue = facetResponse.values[1].value;
        expect(
          buildFacetSelectionChangeMetadata(
            {facetId: facetResponse.facetId, facetValue},
            state
          )
        ).toEqual(
          expect.objectContaining({
            facetField: facetResponse.field,
            facetId: facetResponse.facetId,
            facetTitle: `${facetResponse.field}_${facetResponse.facetId}`,
            facetValue: facetResponse.values[1].value,
          })
        );
      });
    });

    describe('#hierarchical facet', () => {
      const getState = () => {
        const facetId = 'myfacet';
        const field = 'myfield';
        const state = createMockState();
        const facetResponse = buildMockCategoryFacetResponse({
          facetId,
          field,
          values: [
            buildMockCategoryFacetValue({
              state: 'selected',
              value: 'should appear',
              children: [
                buildMockCategoryFacetValue({
                  state: 'selected',
                  value: 'should appear too',
                  children: [
                    buildMockCategoryFacetValue({
                      state: 'idle',
                      value: 'should not appear',
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
        state.search.response.facets = [facetResponse];
        state.categoryFacetSet = {
          [facetResponse.facetId]: buildMockCategoryFacetSlice({
            request: buildMockCategoryFacetRequest({facetId, field}),
          }),
        };
        return {state, facetResponse};
      };

      it('includes only #selected values', () => {
        const {state, facetResponse} = getState();
        const value = `${facetResponse.values[0].value};${facetResponse.values[0].children[0].value}`;
        expect(buildFacetStateMetadata(state)).toEqual([
          expect.objectContaining({
            field: facetResponse.field,
            id: facetResponse.facetId,
            value,
            valuePosition: 1,
            displayValue: value,
            facetType: 'hierarchical',
            state: 'selected',
            facetPosition: 1,
            title: `${facetResponse.field}_${facetResponse.facetId}`,
          }),
        ]);
      });

      it('should include the correct metadata', () => {
        const {state, facetResponse} = getState();
        const facetValue = facetResponse.values[0].value;
        expect(
          buildFacetSelectionChangeMetadata(
            {facetId: facetResponse.facetId, facetValue},
            state
          )
        ).toEqual(
          expect.objectContaining({
            facetField: facetResponse.field,
            facetId: facetResponse.facetId,
            facetTitle: `${facetResponse.field}_${facetResponse.facetId}`,
            facetValue: `${facetResponse.values[0].value};${facetResponse.values[0].children[0].value}`,
          })
        );
      });
    });

    describe('#numerical facet', () => {
      const getState = () => {
        const state = createMockState();
        const facetResponse = buildMockNumericFacetResponse({
          values: [
            buildMockNumericFacetValue({
              state: 'idle',
              start: 1,
              end: 10,
            }),
            buildMockNumericFacetValue({
              state: 'selected',
              start: 50,
              end: 100,
              endInclusive: true,
              numberOfResults: 123,
            }),
          ],
        });
        state.search.response.facets = [facetResponse];
        state.numericFacetSet = {
          [facetResponse.facetId]: buildMockNumericFacetRequest(),
        };
        return {state, facetResponse};
      };

      it('includes #selected values', () => {
        const {state, facetResponse} = getState();
        expect(buildFacetStateMetadata(state)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: facetResponse.field,
              id: facetResponse.facetId,
              value: `${facetResponse.values[1].start}..${facetResponse.values[1].end}`,
              valuePosition: 2,
              displayValue: `${facetResponse.values[1].start}..${facetResponse.values[1].end}`,
              facetType: 'numericalRange',
              state: 'selected',
              facetPosition: 1,
              title: `${facetResponse.field}_${facetResponse.facetId}`,
            }),
          ])
        );
      });

      it('does not include #idle values', () => {
        const {state, facetResponse} = getState();

        expect(buildFacetStateMetadata(state)).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: `${facetResponse.values[0].start}..${facetResponse.values[0].end}`,
            }),
          ])
        );
      });
    });

    describe('#date facet', () => {
      const getState = () => {
        const state = createMockState();
        const facetResponse = buildMockDateFacetResponse({
          values: [
            buildMockDateFacetValue({
              state: 'idle',
              start: 'should not',
              end: 'appear',
            }),
            buildMockDateFacetValue({
              state: 'selected',
              start: 'should',
              end: 'appear',
              endInclusive: true,
              numberOfResults: 123,
            }),
          ],
        });
        state.search.response.facets = [facetResponse];
        state.dateFacetSet = {
          [facetResponse.facetId]: buildMockDateFacetRequest(),
        };
        return {state, facetResponse};
      };

      it('includes #selected values', () => {
        const {state, facetResponse} = getState();
        expect(buildFacetStateMetadata(state)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: facetResponse.field,
              id: facetResponse.facetId,
              value: `${facetResponse.values[1].start}..${facetResponse.values[1].end}`,
              valuePosition: 2,
              displayValue: `${facetResponse.values[1].start}..${facetResponse.values[1].end}`,
              facetType: 'dateRange',
              state: 'selected',
              facetPosition: 1,
              title: `${facetResponse.field}_${facetResponse.facetId}`,
            }),
          ])
        );
      });

      it('does not include #idle values', () => {
        const {state, facetResponse} = getState();

        expect(buildFacetStateMetadata(state)).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: `${facetResponse.values[0].start}..${facetResponse.values[0].end}`,
            }),
          ])
        );
      });
    });
  });
});
