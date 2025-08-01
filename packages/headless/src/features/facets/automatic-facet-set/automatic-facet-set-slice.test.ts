import type {AutomaticFacetGeneratorOptions} from '../../../controllers/facets/automatic-facet-generator/headless-automatic-facet-generator-options.js';
import {buildMockAutomaticFacetResponse} from '../../../test/mock-automatic-facet-response.js';
import {buildMockAutomaticFacetSlice} from '../../../test/mock-automatic-facet-slice.js';
import {buildMockFacetValue} from '../../../test/mock-facet-value.js';
import {buildMockSearch} from '../../../test/mock-search.js';
import {logSearchEvent} from '../../analytics/analytics-actions.js';
import {deselectAllBreadcrumbs} from '../../breadcrumb/breadcrumb-actions.js';
import {executeSearch} from '../../search/search-actions.js';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions.js';
import type {FacetValueState} from '../facet-api/value.js';
import {
  deselectAllAutomaticFacetValues,
  setOptions,
  toggleSelectAutomaticFacetValue,
} from './automatic-facet-set-actions.js';
import {
  DESIRED_COUNT_MAXIMUM,
  DESIRED_COUNT_MINIMUM,
  NUMBER_OF_VALUE_MINIMUM,
} from './automatic-facet-set-constants.js';
//import {DESIRED_COUNT_MINIMUM} from './automatic-facet-set-constants';
import {automaticFacetSetReducer} from './automatic-facet-set-slice.js';
import {
  type AutomaticFacetSetState,
  type AutomaticFacetSlice,
  getAutomaticFacetSetInitialState,
} from './automatic-facet-set-state.js';
import type {AutomaticFacetResponse} from './interfaces/response.js';

describe('automatic-facet-set slice', () => {
  let state: AutomaticFacetSetState;

  beforeEach(() => {
    state = getAutomaticFacetSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = automaticFacetSetReducer(undefined, {type: ''});
    const initialState = getAutomaticFacetSetInitialState();

    expect(finalState).toEqual(initialState);
  });

  describe('#executeSearch.fulfilled', () => {
    function buildExecuteSearchAction(facets: AutomaticFacetResponse[]) {
      const search = buildMockSearch();
      search.response.generateAutomaticFacets = {
        facets,
      };

      return executeSearch.fulfilled(search, '', {
        legacy: logSearchEvent({evt: 'foo'}),
      });
    }

    it('registers facets', () => {
      const facets: AutomaticFacetResponse[] = [
        buildMockAutomaticFacetResponse(),
      ];
      const facetsRecord: Record<string, AutomaticFacetSlice> = {
        [facets[0].field]: {response: facets[0]},
      };
      const action = buildExecuteSearchAction(facets);

      const finalState = automaticFacetSetReducer(state, action);

      expect(finalState.set).toEqual(facetsRecord);
    });
  });

  describe('#setOptions does validation', () => {
    it(`should return an error if desiredCount is lower than ${DESIRED_COUNT_MINIMUM}`, () => {
      expect(setOptions({desiredCount: 0})).toHaveProperty('error');
    });

    it(`should not dispatch #setOptions if desiredCount is higher than ${DESIRED_COUNT_MAXIMUM}`, () => {
      expect(setOptions({desiredCount: 21})).toHaveProperty('error');
    });

    it(`should not dispatch #setOptions if numberOfValue is lower than ${NUMBER_OF_VALUE_MINIMUM}`, () => {
      expect(setOptions({numberOfValues: 0})).toHaveProperty('error');
    });
  });

  it('sets state.desiredCount when #setOptions', () => {
    const options: AutomaticFacetGeneratorOptions = {desiredCount: 8};

    const action = setOptions(options);

    const finalState = automaticFacetSetReducer(state, action);

    expect(finalState.desiredCount).toEqual(options.desiredCount);
  });

  it('sets state.numberOfValues when #setOptions', () => {
    const options: AutomaticFacetGeneratorOptions = {
      desiredCount: 8,
      numberOfValues: 6,
    };

    const action = setOptions(options);

    const finalState = automaticFacetSetReducer(state, action);

    expect(finalState.numberOfValues).toEqual(options.numberOfValues);
  });

  describe('#toggleSelectAutomaticFacetValue', () => {
    it('does nothing if it cannot find the facet', () => {
      const action = toggleSelectAutomaticFacetValue({
        field: 'fieldNotPresent',
        selection: buildMockFacetValue(),
      });

      const finalState = automaticFacetSetReducer(state, action);

      expect(finalState.set).toEqual(state.set);
    });

    it('does nothing if it cannot find the value', () => {
      const response = buildMockAutomaticFacetResponse({
        values: [buildMockFacetValue({value: 'valuePresent'})],
      });
      const slice = buildMockAutomaticFacetSlice({response});

      state.set = {[response.field]: slice};
      const action = toggleSelectAutomaticFacetValue({
        field: 'fieldPresent',
        selection: buildMockFacetValue({value: 'valueNotPresent'}),
      });

      const finalState = automaticFacetSetReducer(state, action);

      expect(finalState.set).toEqual(state.set);
    });

    describe('toggles the value if', () => {
      const field = 'field';
      const value = 'value';
      function buildToggleSelectAutomaticFacetValueAction() {
        return toggleSelectAutomaticFacetValue({
          field,
          selection: buildMockFacetValue({value}),
        });
      }
      function addFacetToState(valueState: FacetValueState) {
        const response = buildMockAutomaticFacetResponse({
          field,
          values: [buildMockFacetValue({value, state: valueState})],
        });
        const slice = buildMockAutomaticFacetSlice({response});

        state.set[field] = slice;
      }

      it('is "selected"', () => {
        addFacetToState('selected');
        const action = buildToggleSelectAutomaticFacetValueAction();

        const finalState = automaticFacetSetReducer(state, action);
        const targetValue = finalState.set[field].response.values.find(
          (req) => req.value === value
        );

        expect(targetValue?.state).toEqual('idle');
      });

      it('is "idle"', () => {
        addFacetToState('idle');
        const action = buildToggleSelectAutomaticFacetValueAction();

        const finalState = automaticFacetSetReducer(state, action);
        const targetValue = finalState.set[field].response.values.find(
          (req) => req.value === value
        );

        expect(targetValue?.state).toEqual('selected');
      });
    });
  });

  describe('#deselectAllAutomaticFacetValues', () => {
    it('does nothing if it cannot find the facet', () => {
      const action = deselectAllAutomaticFacetValues('fieldNotPresent');

      const finalState = automaticFacetSetReducer(state, action);

      expect(finalState.set).toEqual(state.set);
    });

    it('puts all values to "idle"', () => {
      const field = 'field';
      const response = buildMockAutomaticFacetResponse({
        field,
        values: [
          buildMockFacetValue({value: 'value1', state: 'selected'}),
          buildMockFacetValue({value: 'value2', state: 'selected'}),
        ],
      });
      const slice = buildMockAutomaticFacetSlice({response});

      state.set[field] = slice;
      const action = deselectAllAutomaticFacetValues(field);

      const finalState = automaticFacetSetReducer(state, action);
      const targetValues = finalState.set[field].response.values;

      expect(targetValues.every((value) => value.state === 'idle')).toEqual(
        true
      );
    });
  });

  describe('#restoreSearchParameters', () => {
    it('sets #values to the selected values in the payload when a facet is found in the #af payload', () => {
      const field = 'field';
      const initialValue = buildMockFacetValue({value: 'a', state: 'idle'});
      state.set[field] = {
        response: {
          field,
          values: [initialValue],
          moreValuesAvailable: true,
          indexScore: 0.42,
          label: 'potato',
        },
      };

      const value = 'b';
      const af = {[field]: [value]};
      const action = restoreSearchParameters({af});

      const finalState = automaticFacetSetReducer(state, action);
      const selectedValue = buildMockFacetValue({value, state: 'selected'});

      expect(finalState.set[field].response.values).toEqual([
        initialValue,
        selectedValue,
      ]);
    });
  });

  describe('#deselectAllBreadcrumbs', () => {
    it('sets all responses #values to "idle"', () => {
      const field1 = 'field1';
      const field2 = 'field2';
      const response1 = buildMockAutomaticFacetResponse({
        field: field1,
        values: [
          buildMockFacetValue({value: 'value1', state: 'selected'}),
          buildMockFacetValue({value: 'value2', state: 'selected'}),
        ],
      });
      const response2 = buildMockAutomaticFacetResponse({
        field: field2,
        values: [
          buildMockFacetValue({value: 'value1', state: 'selected'}),
          buildMockFacetValue({value: 'value2', state: 'selected'}),
        ],
      });
      const slice1 = buildMockAutomaticFacetSlice({response: response1});
      const slice2 = buildMockAutomaticFacetSlice({response: response2});

      state.set[field1] = slice1;
      state.set[field2] = slice2;
      const action = deselectAllBreadcrumbs();

      const finalState = automaticFacetSetReducer(state, action);
      const targetValues = [
        ...finalState.set[field1].response.values,
        ...finalState.set[field2].response.values,
      ];

      expect(targetValues.every((value) => value.state === 'idle')).toEqual(
        true
      );
    });
  });
});
