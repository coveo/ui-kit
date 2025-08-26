import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetResponse} from '../../../../test/mock-numeric-facet-response.js';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value.js';
import type {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../numeric-facet-set/interfaces/request.js';
import type {NumericFacetValue} from '../numeric-facet-set/interfaces/response.js';
import type {RegisterNumericFacetActionCreatorPayload} from '../numeric-facet-set/numeric-facet-actions.js';
import type {NumericFacetSlice} from '../numeric-facet-set/numeric-facet-set-state.js';
import type {AutomaticRangeFacetOptions} from './interfaces/options.js';
import {
  handleRangeFacetDeselectAll,
  handleRangeFacetSearchParameterRestoration,
  onRangeFacetRequestFulfilled,
  registerRangeFacet,
  toggleSelectRangeValue,
  updateRangeValues,
} from './range-facet-reducers.js';

describe('range facet reducers', () => {
  let state: Record<string, NumericFacetSlice> = {};

  beforeEach(() => {
    state = {};
  });

  describe('#registerRangeFacet', () => {
    function buildAutomaticRegistrationOptions(
      config: Partial<AutomaticRangeFacetOptions<NumericFacetRequest>> = {}
    ): AutomaticRangeFacetOptions<NumericFacetRequest> {
      return {
        facetId: '1',
        field: 'created',
        generateAutomaticRanges: true,
        ...config,
      };
    }

    function register(options: RegisterNumericFacetActionCreatorPayload) {
      const slice = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest(options),
      });
      registerRangeFacet(state, slice);
    }

    it('when the id is unregistered, it registers a range facet', () => {
      const facetId = '1';

      const options = buildAutomaticRegistrationOptions({facetId});
      register(options);

      expect(state[facetId]?.request).toEqual({
        currentValues: [],
        preventAutoSelect: false,
        filterFacetCount: false,
        injectionDepth: 1000,
        numberOfValues: 8,
        sortCriteria: 'ascending',
        type: 'numericalRange',
        rangeAlgorithm: 'even',
        resultsMustMatch: 'atLeastOneValue',
        ...options,
      });
    });

    it('when the id is registered, it does not overwrite', () => {
      const facetId = '1';
      state[facetId] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({facetId, field: 'a'}),
      });

      const options = buildAutomaticRegistrationOptions({facetId, field: 'b'});
      register(options);

      expect(state[facetId]?.request.field).toEqual('a');
    });

    it(`when #generateAutomaticRanges is false, and the number of hard-coded ranges is not equal to the #numberOfValues,
    it sets #numberOfValues to the number of hard-coded ranges`, () => {
      const facetId = '1';
      const options: RegisterNumericFacetActionCreatorPayload = {
        facetId,
        field: '',
        generateAutomaticRanges: false,
        currentValues: [buildMockNumericFacetValue()],
        numberOfValues: 0,
      };

      register(options);

      expect(state[facetId]?.request.numberOfValues).toBe(
        options.currentValues?.length
      );
    });

    it(`when #generateAutomaticRanges is true, and the number of hard-coded ranges is greater than the #numberOfValues,
    it sets #numberOfValues to the number of hard-coded ranges`, () => {
      const facetId = '1';
      const options: RegisterNumericFacetActionCreatorPayload = {
        facetId,
        field: '',
        generateAutomaticRanges: true,
        numberOfValues: 0,
        currentValues: [buildMockNumericFacetValue()],
      };

      register(options);
      expect(state[facetId]?.request.numberOfValues).toBe(
        options.currentValues?.length
      );
    });
  });

  describe('#toggleSelectRangeFacetValue with a registered facet id', () => {
    it('sets the state of an idle value to selected', () => {
      const id = '1';

      const value = buildMockNumericFacetValue({state: 'idle'});
      state[id] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({currentValues: [value]}),
      });

      toggleSelectRangeValue(state, id, value);
      expect(value.state).toBe('selected');
    });

    it('sets the state of an selected value to idle', () => {
      const id = '1';

      const value = buildMockNumericFacetValue({state: 'selected'});
      state[id] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({currentValues: [value]}),
      });

      toggleSelectRangeValue(state, id, value);
      expect(value.state).toBe('idle');
    });

    it('when the range #start values differ, it does not find the value', () => {
      const id = '1';
      const value = buildMockNumericFacetValue({start: 1});
      const candidate = buildMockNumericFacetValue({start: 2});

      state[id] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({currentValues: [value]}),
      });

      toggleSelectRangeValue(state, id, candidate);
      expect(value.state).toBe('idle');
    });

    it('when the range #end values differ, it does not find the value', () => {
      const id = '1';
      const value = buildMockNumericFacetValue({end: 1});
      const candidate = buildMockNumericFacetValue({end: 2});

      state[id] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({currentValues: [value]}),
      });

      toggleSelectRangeValue(state, id, candidate);
      expect(value.state).toBe('idle');
    });

    it('when the range #endInclusive values differ, it finds the value', () => {
      const id = '1';
      const value = buildMockNumericFacetValue({endInclusive: true});
      const candidate = buildMockNumericFacetValue({endInclusive: false});

      state[id] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({currentValues: [value]}),
      });

      toggleSelectRangeValue(state, id, candidate);
      expect(value.state).toBe('selected');
    });

    it('sets #preventAutoSelect to true', () => {
      const id = '1';

      const value = buildMockNumericFacetValue({state: 'selected'});
      state[id] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({currentValues: [value]}),
      });

      toggleSelectRangeValue(state, id, value);
      expect(state[id]?.request.preventAutoSelect).toBe(true);
    });
  });

  it('dispatching #toggleSelectFacetValue with an unregistered id does not throw', () => {
    const value = buildMockNumericFacetValue();
    expect(() =>
      toggleSelectRangeValue(state, 'unknownId', value)
    ).not.toThrow();
  });

  describe('#handleRangeFacetDeselectAll', () => {
    it('when the passed id is registered, it sets the values #state to idle', () => {
      const id = '1';
      const value = buildMockNumericFacetValue({state: 'selected'});
      const state = {
        [id]: buildMockNumericFacetSlice({
          request: buildMockNumericFacetRequest({currentValues: [value]}),
        }),
      };

      handleRangeFacetDeselectAll(state, id);
      expect(value.state).toBe('idle');
    });

    it('when the passed id is not registered, it does not throw', () => {
      expect(() => handleRangeFacetDeselectAll({}, '1')).not.toThrow();
    });

    it('sets #previousState correctly when transitioning from selected to idle', () => {
      const id = '1';
      const selectedValue: NumericRangeRequest = {
        start: 0,
        end: 10,
        endInclusive: false,
        state: 'selected',
      };
      const state = {
        [id]: buildMockNumericFacetSlice({
          request: buildMockNumericFacetRequest({
            currentValues: [selectedValue],
          }),
        }),
      };

      handleRangeFacetDeselectAll(state, id);

      expect(selectedValue.previousState).toBe('selected');
    });

    it('sets #previousState correctly when transitioning from excluded to idle', () => {
      const id = '1';
      const excludedValue: NumericRangeRequest = {
        start: 0,
        end: 10,
        endInclusive: false,
        state: 'excluded',
      };
      const state = {
        [id]: buildMockNumericFacetSlice({
          request: buildMockNumericFacetRequest({
            currentValues: [excludedValue],
          }),
        }),
      };

      handleRangeFacetDeselectAll(state, id);

      expect(excludedValue.previousState).toBe('excluded');
    });

    it('handles mixed state transitions correctly', () => {
      const id = '1';
      const selectedValue: NumericRangeRequest = {
        start: 0,
        end: 10,
        endInclusive: false,
        state: 'selected',
      };
      const excludedValue: NumericRangeRequest = {
        start: 10,
        end: 20,
        endInclusive: false,
        state: 'excluded',
      };
      const idleValue: NumericRangeRequest = {
        start: 20,
        end: 30,
        endInclusive: false,
        state: 'idle',
      };
      const state = {
        [id]: buildMockNumericFacetSlice({
          request: buildMockNumericFacetRequest({
            currentValues: [selectedValue, excludedValue, idleValue],
          }),
        }),
      };

      handleRangeFacetDeselectAll(state, id);

      expect(selectedValue.previousState).toBe('selected');
      expect(excludedValue.previousState).toBe('excluded');
      expect(idleValue.previousState).toBeUndefined();
    });

    it('preserves existing #previousState when value was already idle', () => {
      const id = '1';
      const idleValueWithPreviousState: NumericRangeRequest = {
        start: 0,
        end: 10,
        endInclusive: false,
        state: 'idle',
        previousState: 'selected',
      };
      const state = {
        [id]: buildMockNumericFacetSlice({
          request: buildMockNumericFacetRequest({
            currentValues: [idleValueWithPreviousState],
          }),
        }),
      };

      handleRangeFacetDeselectAll(state, id);

      expect(idleValueWithPreviousState.state).toBe('idle');
      // Should not change existing previousState since the value was already idle
      expect(idleValueWithPreviousState.previousState).toBe('selected');
    });
  });

  describe('#handleRangeFacetSearchParameterRestoration', () => {
    it('when request #currentValues range is found in the payload, it selects it', () => {
      const id = 'size';
      const value = buildMockNumericFacetValue({
        start: 0,
        end: 10,
        state: 'idle',
      });

      state = {
        [id]: buildMockNumericFacetSlice({
          request: buildMockNumericFacetRequest({currentValues: [value]}),
        }),
      };
      const nf = {[id]: [value]};

      handleRangeFacetSearchParameterRestoration(state, nf);
      expect(value.state).toBe('selected');
    });

    it('when a request #currentValues range is not found in the payload, it does not unselect it', () => {
      const value = buildMockNumericFacetValue({
        start: 0,
        end: 10,
        state: 'selected',
      });

      state = {
        size: buildMockNumericFacetSlice({
          request: buildMockNumericFacetRequest({currentValues: [value]}),
        }),
      };
      const nf = {};

      handleRangeFacetSearchParameterRestoration(state, nf);
      expect(value.state).toBe('selected');
    });

    it('when a range in the payload is not found, it adds it to #currentValues', () => {
      const id = 'size';
      const request = buildMockNumericFacetRequest({currentValues: []});
      state = {[id]: buildMockNumericFacetSlice({request})};

      const value = buildMockNumericFacetValue();
      const nf = {[id]: [value]};

      handleRangeFacetSearchParameterRestoration(state, nf);
      expect(request.currentValues).toContain(value);
    });

    it(`when the length of #currentValues is less than the requested #numberOfValues,
    it does not change the number of values`, () => {
      const id = 'size';
      const request = buildMockNumericFacetRequest({
        currentValues: [],
        numberOfValues: 8,
      });
      state = {[id]: buildMockNumericFacetSlice({request})};
      const nf = {[id]: [buildMockNumericFacetValue()]};

      handleRangeFacetSearchParameterRestoration(state, nf);
      expect(request.numberOfValues).toEqual(8);
    });

    it(`when the length of #currentValues is greater than the requested #numberOfValues,
    it sets the number of values to the length of #currentValues`, () => {
      const id = 'size';
      const request = buildMockNumericFacetRequest({
        currentValues: [],
        numberOfValues: 0,
      });
      state = {[id]: buildMockNumericFacetSlice({request})};
      const nf = {[id]: [buildMockNumericFacetValue()]};

      handleRangeFacetSearchParameterRestoration(state, nf);
      expect(request.numberOfValues).toEqual(1);
    });
  });

  describe('#onRangeRequestSearchFulfilled', () => {
    function convertToRangeValueRequests(
      values: NumericFacetValue[]
    ): NumericRangeRequest[] {
      return values.map((v) => {
        const {numberOfResults: _numberOfResults, ...rest} = v;
        return rest;
      });
    }

    it('updates the currentValues of requests to the values in the response', () => {
      const id = '1';
      const values = [buildMockNumericFacetValue()];
      const facet = buildMockNumericFacetResponse({facetId: id, values});

      state[id] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({facetId: id}),
      });
      onRangeFacetRequestFulfilled(state, [facet], convertToRangeValueRequests);

      const expectedRanges = convertToRangeValueRequests(values);
      expect(state[id]?.request.currentValues).toEqual(expectedRanges);
    });

    it('sets #preventAutoSelect to false', () => {
      const id = '1';
      state[id] = buildMockNumericFacetSlice({
        request: buildMockNumericFacetRequest({preventAutoSelect: true}),
      });

      const facet = buildMockNumericFacetResponse({facetId: id});
      onRangeFacetRequestFulfilled(state, [facet], convertToRangeValueRequests);

      expect(state[id]?.request.preventAutoSelect).toBe(false);
    });

    it('response containing unregistered facet ids does not throw', () => {
      const id = '1';
      const facet = buildMockNumericFacetResponse({facetId: id});
      const action = () =>
        onRangeFacetRequestFulfilled(
          state,
          [facet],
          convertToRangeValueRequests
        );

      expect(action).not.toThrow();
    });
  });

  describe('#updateRangeValues', () => {
    const facetId = '1';
    const values = [buildMockNumericFacetValue(), buildMockNumericFacetValue()];

    it("when the id is unregistered, it doesn't update the values", () => {
      updateRangeValues(state, facetId, values);

      expect(state[facetId]).toBeFalsy();
    });

    it('when the id is registered, it updates the values', () => {
      state[facetId] = buildMockNumericFacetSlice();
      updateRangeValues(state, facetId, values);

      expect(state[facetId]?.request.currentValues).toEqual(values);
      expect(state[facetId]?.request.numberOfValues).toBe(values.length);
    });
  });
});
