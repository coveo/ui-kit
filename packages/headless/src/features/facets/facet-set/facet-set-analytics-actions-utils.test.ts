import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request.js';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice.js';
import {buildMockCategoryFacetValueRequest} from '../../../test/mock-category-facet-value-request.js';
import {buildMockDateFacetRequest} from '../../../test/mock-date-facet-request.js';
import {buildMockDateFacetSlice} from '../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../test/mock-date-facet-value.js';
import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request.js';
import {buildMockNumericFacetRequest} from '../../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetSlice} from '../../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../../test/mock-numeric-facet-value.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildFacetSelectionChangeMetadata,
  buildFacetStateMetadata,
} from './facet-set-analytics-actions-utils.js';

describe('facet-set-analytics-action-utils', () => {
  describe('#buildFacetStateMetadata & #buildFacetSelectionChangeMetadata', () => {
    describe('#specific facet', () => {
      const facetId = 'myfacet';
      const field = 'myfield';
      const getState = () => {
        const state = createMockState();
        const facetRequest = buildMockFacetRequest({
          facetId,
          field,
          currentValues: [
            buildMockFacetValueRequest({
              value: 'should not appear',
              state: 'idle',
            }),
            buildMockFacetValueRequest({
              value: 'should appear',
              state: 'selected',
            }),
          ],
        });
        state.search.response.facets = [];
        state.facetSet = {
          [facetRequest.facetId]: buildMockFacetSlice({
            request: buildMockFacetRequest(facetRequest),
          }),
        };
        return {state, facetRequest};
      };

      it('includes #selected values in the facet state', () => {
        const {state, facetRequest} = getState();
        expect(buildFacetStateMetadata(state)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: facetRequest.field,
              id: facetRequest.facetId,
              value: facetRequest.currentValues[1].value,
              valuePosition: 2,
              displayValue: facetRequest.currentValues[1].value,
              facetType: 'specific',
              state: 'selected',
              facetPosition: 1,
              title: `${facetRequest.field}_${facetRequest.facetId}`,
            }),
          ])
        );
      });

      it('does not include #idle values in the facet state', () => {
        const {state, facetRequest} = getState();

        expect(buildFacetStateMetadata(state)).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: facetRequest.currentValues[0].value,
            }),
          ])
        );
      });

      it('should include the correct metadata', () => {
        const {state, facetRequest} = getState();
        const facetValue = facetRequest.currentValues[1].value;
        expect(
          buildFacetSelectionChangeMetadata(
            {facetId: facetRequest.facetId, facetValue},
            state
          )
        ).toEqual(
          expect.objectContaining({
            facetField: facetRequest.field,
            facetId: facetRequest.facetId,
            facetTitle: `${facetRequest.field}_${facetRequest.facetId}`,
            facetValue: facetRequest.currentValues[1].value,
          })
        );
      });
    });

    describe('#hierarchical facet', () => {
      const getState = () => {
        const facetId = 'myfacet';
        const field = 'myfield';
        const state = createMockState();
        const facetRequest = buildMockCategoryFacetRequest({
          facetId,
          field,
          currentValues: [
            buildMockCategoryFacetValueRequest({
              state: 'idle',
              value: 'should appear',
              children: [
                buildMockCategoryFacetValueRequest({
                  state: 'selected',
                  value: 'should appear too',
                  children: [
                    buildMockCategoryFacetValueRequest({
                      state: 'idle',
                      value: 'should not appear',
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
        state.search.response.facets = [];
        state.categoryFacetSet = {
          [facetRequest.facetId]: buildMockCategoryFacetSlice({
            request: buildMockCategoryFacetRequest(facetRequest),
          }),
        };
        return {state, facetRequest};
      };

      it('includes only #selected values', () => {
        const {state, facetRequest} = getState();
        const value = `${facetRequest.currentValues[0].value};${facetRequest.currentValues[0].children[0].value}`;
        expect(buildFacetStateMetadata(state)).toEqual([
          expect.objectContaining({
            field: facetRequest.field,
            id: facetRequest.facetId,
            value,
            valuePosition: 1,
            displayValue: value,
            facetType: 'hierarchical',
            state: 'selected',
            facetPosition: 1,
            title: `${facetRequest.field}_${facetRequest.facetId}`,
          }),
        ]);
      });

      it('should include the correct metadata', () => {
        const {state, facetRequest} = getState();
        const facetValue = facetRequest.currentValues[0].value;
        expect(
          buildFacetSelectionChangeMetadata(
            {facetId: facetRequest.facetId, facetValue},
            state
          )
        ).toEqual(
          expect.objectContaining({
            facetField: facetRequest.field,
            facetId: facetRequest.facetId,
            facetTitle: `${facetRequest.field}_${facetRequest.facetId}`,
            facetValue: `${facetRequest.currentValues[0].value};${facetRequest.currentValues[0].children[0].value}`,
          })
        );
      });
    });

    describe('#numerical facet', () => {
      const getState = () => {
        const state = createMockState();
        const facetRequest = buildMockNumericFacetRequest({
          currentValues: [
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
        state.search.response.facets = [];
        state.numericFacetSet = {
          [facetRequest.facetId]: buildMockNumericFacetSlice({
            request: facetRequest,
          }),
        };
        return {state, facetRequest};
      };

      it('includes #selected values', () => {
        const {state, facetRequest} = getState();
        expect(buildFacetStateMetadata(state)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: facetRequest.field,
              id: facetRequest.facetId,
              value: `${facetRequest.currentValues[1].start}..${facetRequest.currentValues[1].end}`,
              valuePosition: 2,
              displayValue: `${facetRequest.currentValues[1].start}..${facetRequest.currentValues[1].end}`,
              facetType: 'numericalRange',
              state: 'selected',
              facetPosition: 1,
              title: `${facetRequest.field}_${facetRequest.facetId}`,
            }),
          ])
        );
      });

      it('does not include #idle values', () => {
        const {state, facetRequest} = getState();

        expect(buildFacetStateMetadata(state)).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: `${facetRequest.currentValues[0].start}..${facetRequest.currentValues[0].end}`,
            }),
          ])
        );
      });
    });

    describe('#date facet', () => {
      const getState = () => {
        const state = createMockState();
        const facetRequest = buildMockDateFacetRequest({
          currentValues: [
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
        state.search.response.facets = [];
        state.dateFacetSet = {
          [facetRequest.facetId]: buildMockDateFacetSlice({
            request: facetRequest,
          }),
        };
        return {state, facetRequest};
      };

      it('includes #selected values', () => {
        const {state, facetRequest} = getState();
        expect(buildFacetStateMetadata(state)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              field: facetRequest.field,
              id: facetRequest.facetId,
              value: `${facetRequest.currentValues[1].start}..${facetRequest.currentValues[1].end}`,
              valuePosition: 2,
              displayValue: `${facetRequest.currentValues[1].start}..${facetRequest.currentValues[1].end}`,
              facetType: 'dateRange',
              state: 'selected',
              facetPosition: 1,
              title: `${facetRequest.field}_${facetRequest.facetId}`,
            }),
          ])
        );
      });

      it('does not include #idle values', () => {
        const {state, facetRequest} = getState();

        expect(buildFacetStateMetadata(state)).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: `${facetRequest.currentValues[0].start}..${facetRequest.currentValues[0].end}`,
            }),
          ])
        );
      });
    });
  });
});
