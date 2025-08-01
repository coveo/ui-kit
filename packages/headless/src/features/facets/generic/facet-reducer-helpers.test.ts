import {buildMockFacetRequest} from '../../../test/mock-facet-request.js';
import {buildMockFacetSlice} from '../../../test/mock-facet-slice.js';
import {buildMockFacetValueRequest} from '../../../test/mock-facet-value-request.js';
import type {FacetRequest} from '../facet-set/interfaces/request.js';
import {
  handleFacetDeselectAll,
  handleFacetSortCriterionUpdate,
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

      it('sets #previousState correctly when transitioning from selected to idle', () => {
        const selectedValue = buildMockFacetValueRequest({
          value: 'selected-value',
          state: 'selected',
        });
        const request = buildMockFacetRequest({
          currentValues: [selectedValue],
        });

        handleFacetDeselectAll(request);

        expect(request.currentValues[0]).toEqual({
          value: 'selected-value',
          state: 'idle',
          previousState: 'selected',
        });
      });

      it('sets #previousState correctly when transitioning from excluded to idle', () => {
        const excludedValue = buildMockFacetValueRequest({
          value: 'excluded-value',
          state: 'excluded',
        });
        const request = buildMockFacetRequest({
          currentValues: [excludedValue],
        });

        handleFacetDeselectAll(request);

        expect(request.currentValues[0]).toEqual({
          value: 'excluded-value',
          state: 'idle',
          previousState: 'excluded',
        });
      });

      it('handles mixed state transitions correctly', () => {
        const selectedValue = buildMockFacetValueRequest({
          value: 'selected-value',
          state: 'selected',
        });
        const excludedValue = buildMockFacetValueRequest({
          value: 'excluded-value',
          state: 'excluded',
        });
        const idleValue = buildMockFacetValueRequest({
          value: 'idle-value',
          state: 'idle',
        });
        const request = buildMockFacetRequest({
          currentValues: [selectedValue, excludedValue, idleValue],
        });

        handleFacetDeselectAll(request);

        expect(request.currentValues).toEqual([
          {
            value: 'selected-value',
            state: 'idle',
            previousState: 'selected',
          },
          {
            value: 'excluded-value',
            state: 'idle',
            previousState: 'excluded',
          },
          {
            value: 'idle-value',
            state: 'idle',
          },
        ]);
        expect(request.currentValues[2].previousState).toBeUndefined();
      });

      it('does not preserve existing #previousState when value was already idle', () => {
        const idleValueWithPreviousState = buildMockFacetValueRequest({
          value: 'idle-with-previous',
          state: 'idle',
          previousState: 'selected',
        });
        const request = buildMockFacetRequest({
          currentValues: [idleValueWithPreviousState],
        });

        handleFacetDeselectAll(request);

        expect(request.currentValues[0]).toEqual({
          value: 'idle-with-previous',
          state: 'idle',
        });
        expect(request.currentValues[0].previousState).toBeUndefined();
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
