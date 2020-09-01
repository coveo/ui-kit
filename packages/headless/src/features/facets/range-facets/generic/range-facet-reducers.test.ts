import {
  registerRangeFacet,
  toggleSelectRangeValue,
  onRangeFacetRequestFulfilled,
  handleRangeFacetDeselectAll,
} from './range-facet-reducers';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request';
import {NumericFacetRegistrationOptions} from '../numeric-facet-set/interfaces/options';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../numeric-facet-set/interfaces/request';
import {AutomaticRangeFacetOptions} from './interfaces/options';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {NumericFacetValue} from '../numeric-facet-set/interfaces/response';
import {buildMockNumericFacetResponse} from '../../../../test/mock-numeric-facet-response';

describe('range facet reducers', () => {
  let state: Record<string, NumericFacetRequest> = {};

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

    function register(options: NumericFacetRegistrationOptions) {
      const request = buildMockNumericFacetRequest(options);
      registerRangeFacet<NumericFacetRequest>(state, request);
    }

    it('when the id is unregistered, it registers a range facet', () => {
      const facetId = '1';

      const options = buildAutomaticRegistrationOptions({facetId});
      register(options);

      expect(state[facetId]).toEqual({
        currentValues: [],
        preventAutoSelect: false,
        filterFacetCount: false,
        injectionDepth: 1000,
        numberOfValues: 8,
        sortCriteria: 'ascending',
        type: 'numericalRange',
        ...options,
      });
    });

    it('when the id is registered, it does not overwrite', () => {
      const facetId = '1';
      state[facetId] = buildMockNumericFacetRequest({facetId, field: 'a'});

      const options = buildAutomaticRegistrationOptions({facetId, field: 'b'});
      register(options);

      expect(state[facetId].field).toEqual('a');
    });

    it(`when #generateAutomaticRanges is false, and the number of hard-coded ranges is not equal to the #numberOfValues,
    it sets #numberOfValues to the number of hard-coded ranges`, () => {
      const facetId = '1';
      const options: NumericFacetRegistrationOptions = {
        facetId,
        field: '',
        generateAutomaticRanges: false,
        currentValues: [buildMockNumericFacetValue()],
        numberOfValues: 0,
      };

      register(options);

      expect(state[facetId].numberOfValues).toBe(options.currentValues.length);
    });

    it(`when #generateAutomaticRanges is true, and the number of hard-coded ranges is greater than the #numberOfValues,
    it sets #numberOfValues to the number of hard-coded ranges`, () => {
      const facetId = '1';
      const options: NumericFacetRegistrationOptions = {
        facetId,
        field: '',
        generateAutomaticRanges: true,
        numberOfValues: 0,
        currentValues: [buildMockNumericFacetValue()],
      };

      register(options);
      expect(state[facetId].numberOfValues).toBe(options.currentValues?.length);
    });
  });

  describe('#toggleSelectRangeFacetValue with a registered facet id', () => {
    it('sets the state of an idle value to selected', () => {
      const id = '1';

      const value = buildMockNumericFacetValue({state: 'idle'});
      state[id] = buildMockNumericFacetRequest({currentValues: [value]});

      toggleSelectRangeValue(state, id, value);
      expect(value.state).toBe('selected');
    });

    it('sets the state of an selected value to idle', () => {
      const id = '1';

      const value = buildMockNumericFacetValue({state: 'selected'});
      state[id] = buildMockNumericFacetRequest({currentValues: [value]});

      toggleSelectRangeValue(state, id, value);
      expect(value.state).toBe('idle');
    });

    it('when the range #start values differ, it does not find the value', () => {
      const id = '1';
      const value = buildMockNumericFacetValue({start: 1});
      const candidate = buildMockNumericFacetValue({start: 2});

      state[id] = buildMockNumericFacetRequest({currentValues: [value]});

      toggleSelectRangeValue(state, id, candidate);
      expect(value.state).toBe('idle');
    });

    it('when the range #end values differ, it does not find the value', () => {
      const id = '1';
      const value = buildMockNumericFacetValue({end: 1});
      const candidate = buildMockNumericFacetValue({end: 2});

      state[id] = buildMockNumericFacetRequest({currentValues: [value]});

      toggleSelectRangeValue(state, id, candidate);
      expect(value.state).toBe('idle');
    });

    it('when the range #endInclusive values differ, it does not find the value', () => {
      const id = '1';
      const value = buildMockNumericFacetValue({endInclusive: true});
      const candidate = buildMockNumericFacetValue({endInclusive: false});

      state[id] = buildMockNumericFacetRequest({currentValues: [value]});

      toggleSelectRangeValue(state, id, candidate);
      expect(value.state).toBe('idle');
    });

    it('sets #preventAutoSelect to true', () => {
      const id = '1';

      const value = buildMockNumericFacetValue({state: 'selected'});
      state[id] = buildMockNumericFacetRequest({currentValues: [value]});

      toggleSelectRangeValue(state, id, value);
      expect(state[id].preventAutoSelect).toBe(true);
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
        [id]: buildMockNumericFacetRequest({currentValues: [value]}),
      };

      handleRangeFacetDeselectAll(state, id);
      expect(value.state).toBe('idle');
    });

    it('when the passed id is not registered, it does not throw', () => {
      expect(() => handleRangeFacetDeselectAll({}, '1')).not.toThrow();
    });
  });

  describe('#onRangeRequestSearchFulfilled', () => {
    function convertToRangeValueRequests(
      values: NumericFacetValue[]
    ): NumericRangeRequest[] {
      return values.map((v) => {
        const {numberOfResults, ...rest} = v;
        return rest;
      });
    }

    it('updates the currentValues of requests to the values in the response', () => {
      const id = '1';
      const values = [buildMockNumericFacetValue()];
      const facet = buildMockNumericFacetResponse({facetId: id, values});

      state[id] = buildMockNumericFacetRequest({facetId: id});
      onRangeFacetRequestFulfilled(state, [facet], convertToRangeValueRequests);

      const expectedRanges = convertToRangeValueRequests(values);
      expect(state[id].currentValues).toEqual(expectedRanges);
    });

    it('sets #preventAutoSelect to false', () => {
      const id = '1';
      state[id] = buildMockNumericFacetRequest({preventAutoSelect: true});

      const facet = buildMockNumericFacetResponse({facetId: id});
      onRangeFacetRequestFulfilled(state, [facet], convertToRangeValueRequests);

      expect(state[id].preventAutoSelect).toBe(false);
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
});
