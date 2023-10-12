import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request.js';
import {FacetRequest} from '../facet-set/interfaces/request.js';
import {
  handleFacetSortCriterionUpdate,
  handleFacetDeselectAll,
  handleFacetUpdateNumberOfValues,
} from './facet-reducer-helpers.js';

describe('generic facet reducers', () => {
  describe('#handleFacetSortCriterionUpdate', () => {
    it('when the facet id is registered, it updates the sort criterion to the passed value', () => {
      const id = '1';
      const criterion = 'alphanumeric';
      const state = {[id]: buildMockFacetSlice()};

      handleFacetSortCriterionUpdate(state, {
        facetId: id,
        criterion,
      });

      expect(state[id]?.request.sortCriteria).toBe(criterion);
    });

    it('when the facet id is not registered, it does not throw', () => {
      const id = '1';
      const criterion = 'alphanumeric';

      const method = () =>
        handleFacetSortCriterionUpdate({}, {facetId: id, criterion});
      expect(method).not.toThrow();
    });
  });

  describe('#handleFacetDeselectAll', () => {
    describe('when the request is defined', () => {
      it('sets all #currentValues state to idle', () => {
        const value = buildMockFacetValueRequest();
        const anotherValue = buildMockFacetValueRequest({value: 'hello'});
        const request = buildMockFacetRequest({
          currentValues: [value, anotherValue],
        });

        handleFacetDeselectAll(request);
        expect(request.currentValues).toEqual([
          {...value, state: 'idle'},
          {...anotherValue, state: 'idle'},
        ]);
      });

      it('sets #preventAutoSelect to true on the request', () => {
        const request = buildMockFacetRequest({preventAutoSelect: false});

        handleFacetDeselectAll(request);
        expect(request.preventAutoSelect).toBe(true);
      });
    });

    it('when the request is not defined, it does not throw', () => {
      expect(() =>
        handleFacetDeselectAll(undefined as unknown as FacetRequest)
      ).not.toThrow();
    });
  });

  describe('#handleFacetUpdateNumberOfValues', () => {
    it('when the request is defined, it updates the number of values', () => {
      const request = buildMockFacetRequest();
      const numberOfValues = 20;

      handleFacetUpdateNumberOfValues(request, numberOfValues);
      expect(request.numberOfValues).toBe(numberOfValues);
    });

    it('when the request not defined, it does not throw', () => {
      const method = () => handleFacetUpdateNumberOfValues(undefined, 20);
      expect(method).not.toThrow();
    });
  });
});
