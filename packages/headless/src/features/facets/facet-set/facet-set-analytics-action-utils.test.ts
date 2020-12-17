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
import {buildFacetStateMetadata} from './facet-set-analytics-actions-utils';

describe('facet-set-analytics-action-utils', () => {
  describe('#buildFacetStateMetadata', () => {
    describe('#specific facet', () => {
      const getState = () => {
        const state = createMockState();
        const facetResponse = buildMockFacetResponse({
          values: [
            {numberOfResults: 1, value: 'should not appear', state: 'idle'},
            {numberOfResults: 1, value: 'should appear', state: 'selected'},
          ],
        });
        state.search.response.facets = [facetResponse];
        state.facetSet = {
          [facetResponse.facetId]: buildMockFacetRequest(),
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
              value: facetResponse.values[1].value,
              valuePosition: 2,
              displayValue: facetResponse.values[1].value,
              facetType: 'specific',
              state: 'selected',
              facetPosition: 1,
              title: facetResponse.field,
            }),
          ])
        );
      });

      it('does not include #idle values', () => {
        const {state, facetResponse} = getState();

        expect(buildFacetStateMetadata(state)).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: facetResponse.values[0].value,
            }),
          ])
        );
      });
    });

    describe('#hierarchical facet', () => {
      const getState = () => {
        const state = createMockState();
        const facetResponse = buildMockCategoryFacetResponse({
          values: [
            buildMockCategoryFacetValue({
              state: 'idle',
              value: 'should not appear',
            }),
            buildMockCategoryFacetValue({
              state: 'selected',
              value: 'should appear',
            }),
          ],
        });
        state.search.response.facets = [facetResponse];
        state.categoryFacetSet = {
          [facetResponse.facetId]: buildMockCategoryFacetSlice(),
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
              value: facetResponse.values[1].value,
              valuePosition: 2,
              displayValue: facetResponse.values[1].value,
              facetType: 'hierarchical',
              state: 'selected',
              facetPosition: 1,
              title: facetResponse.field,
            }),
          ])
        );
      });

      it('does not include #idle values', () => {
        const {state, facetResponse} = getState();

        expect(buildFacetStateMetadata(state)).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: facetResponse.values[0].value,
            }),
          ])
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
              title: facetResponse.field,
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
              title: facetResponse.field,
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
