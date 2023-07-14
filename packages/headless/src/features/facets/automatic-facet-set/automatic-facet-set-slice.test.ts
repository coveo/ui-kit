import {buildMockAutomaticFacetResponse} from '../../../test/mock-automatic-facet-response';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {buildMockSearch} from '../../../test/mock-search';
import {logSearchEvent} from '../../analytics/analytics-actions';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import {executeSearch} from '../../search/search-actions';
import {FacetValueState} from '../facet-api/value';
import {
  deselectAllAutomaticFacetValues,
  setDesiredCount,
  toggleSelectAutomaticFacetValue,
} from './automatic-facet-set-actions';
import {automaticFacetSetReducer} from './automatic-facet-set-slice';
import {
  AutomaticFacetSetState,
  getAutomaticFacetSetInitialState,
} from './automatic-facet-set-state';
import {AutomaticFacetResponse} from './interfaces/response';

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

      return executeSearch.fulfilled(search, '', logSearchEvent({evt: 'foo'}));
    }

    it('registers facets', () => {
      const facets: AutomaticFacetResponse[] = [
        buildMockAutomaticFacetResponse(),
      ];
      const facetsRecord: Record<string, AutomaticFacetResponse> = {
        [facets[0].field]: facets[0],
      };
      const action = buildExecuteSearchAction(facets);

      const finalState = automaticFacetSetReducer(state, action);

      expect(finalState.facets).toEqual(facetsRecord);
    });
  });

  it('sets state.desiredCount when #setDesiredCount', () => {
    const desiredCount = 5;
    const action = setDesiredCount(desiredCount);

    const finalState = automaticFacetSetReducer(state, action);

    expect(finalState.desiredCount).toEqual(desiredCount);
  });

  describe('#toggleSelectAutomaticFacetValue', () => {
    it('does nothing if it cannot find the facet', () => {
      const action = toggleSelectAutomaticFacetValue({
        field: 'fieldNotPresent',
        selection: buildMockFacetValue(),
      });

      const finalState = automaticFacetSetReducer(state, action);

      expect(finalState.facets).toEqual(state.facets);
    });

    it('does nothing if it cannot find the value', () => {
      const facet = buildMockAutomaticFacetResponse({
        values: [buildMockFacetValue({value: 'valuePresent'})],
      });
      state.facets = {[facet.field]: facet};
      const action = toggleSelectAutomaticFacetValue({
        field: 'fieldPresent',
        selection: buildMockFacetValue({value: 'valueNotPresent'}),
      });

      const finalState = automaticFacetSetReducer(state, action);

      expect(finalState.facets).toEqual(state.facets);
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
        const facet = buildMockAutomaticFacetResponse({
          field,
          values: [buildMockFacetValue({value, state: valueState})],
        });
        state.facets[field] = facet;
      }

      it('is "selected"', () => {
        addFacetToState('selected');
        const action = buildToggleSelectAutomaticFacetValueAction();

        const finalState = automaticFacetSetReducer(state, action);
        const targetValue = finalState.facets[field].values.find(
          (req) => req.value === value
        );

        expect(targetValue?.state).toEqual('idle');
      });

      it('is "idle"', () => {
        addFacetToState('idle');
        const action = buildToggleSelectAutomaticFacetValueAction();

        const finalState = automaticFacetSetReducer(state, action);
        const targetValue = finalState.facets[field].values.find(
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

      expect(finalState.facets).toEqual(state.facets);
    });

    it('puts all values to "idle"', () => {
      const field = 'field';
      const facet = buildMockAutomaticFacetResponse({
        field,
        values: [
          buildMockFacetValue({value: 'value1', state: 'selected'}),
          buildMockFacetValue({value: 'value2', state: 'selected'}),
        ],
      });
      state.facets[field] = facet;
      const action = deselectAllAutomaticFacetValues(field);

      const finalState = automaticFacetSetReducer(state, action);
      const targetValues = finalState.facets[field].values;

      expect(targetValues.every((value) => value.state === 'idle')).toEqual(
        true
      );
    });
  });

  describe('#restoreSearchParameters', () => {
    it(`it sets #values to the selected values in the payload 
    when a facet is found in the #af payload`, () => {
      const field = 'field';
      const value = 'a';
      const af = {[field]: [value]};
      const action = restoreSearchParameters({af});

      const finalState = automaticFacetSetReducer(state, action);
      const selectedValue = buildMockFacetValue({value, state: 'selected'});

      expect(finalState.facets[field].values).toEqual([selectedValue]);
    });
  });
});
