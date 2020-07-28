import {
  rangeFacetSetReducer,
  RangeFacetSetState,
  getRangeFacetSetInitialState,
} from './range-facet-set-slice';
import {registerRangeFacet} from './range-facet-set-actions';
import {RangeFacetRegistrationOptions} from './interfaces/options';
import {buildMockRangeFacetRequest} from '../../../test/mock-range-facet-request';
import {change} from '../../history/history-actions';
import {getHistoryEmptyState} from '../../history/history-slice';

describe('range-facet slice', () => {
  let state: RangeFacetSetState;

  function buildRegistrationOptions(
    config: Partial<RangeFacetRegistrationOptions>
  ): RangeFacetRegistrationOptions {
    return {
      currentValues: [],
      facetId: '1',
      field: 'created',
      generateAutomaticRanges: true,
      type: 'dateRange',
      ...config,
    };
  }
  beforeEach(() => {
    state = getRangeFacetSetInitialState();
  });

  it('initializes the state correctly', () => {
    const finalState = rangeFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('when the id is unregistered, it registers a range facet', () => {
    const facetId = '1';
    const options = buildRegistrationOptions({facetId});

    const action = registerRangeFacet(options);
    const finalState = rangeFacetSetReducer(state, action);

    expect(finalState[facetId]).toEqual({
      currentValues: [],
      isFieldExpanded: false,
      preventAutoSelect: false,
      freezeCurrentValues: false,
      filterFacetCount: false,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'ascending',
      ...options,
    });
  });

  it('when the id is registered, it does not overwrite', () => {
    const facetId = '1';
    state[facetId] = buildMockRangeFacetRequest({facetId, field: 'a'});

    const options = buildRegistrationOptions({facetId, field: 'b'});
    const action = registerRangeFacet(options);

    const finalState = rangeFacetSetReducer(state, action);
    expect(finalState[facetId].field).toEqual('a');
  });

  it('updates the set on history change', () => {
    const rangeFacetSet = {a: buildMockRangeFacetRequest()};

    const history = {...getHistoryEmptyState(), rangeFacetSet};
    const action = change.fulfilled(history, '');
    const finalState = rangeFacetSetReducer(state, action);

    expect(finalState).toEqual(rangeFacetSet);
  });
});
