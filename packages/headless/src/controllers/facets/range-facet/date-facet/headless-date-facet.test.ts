import {
  DateFacet,
  buildDateFacet,
  DateFacetOptions,
  buildDateRange,
} from './headless-date-facet';
import {MockEngine, buildMockEngine} from '../../../../test/mock-engine';
import {SearchPageState} from '../../../../state';
import {createMockState} from '../../../../test/mock-state';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildMockDateFacetResponse} from '../../../../test/mock-date-facet-response';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request';

describe('date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: SearchPageState;
  let engine: MockEngine;
  let dateFacet: DateFacet;

  function initDateFacet() {
    engine = buildMockEngine({state});
    dateFacet = buildDateFacet(engine, {options});
  }

  beforeEach(() => {
    options = {
      facetId,
      field: 'created',
      generateAutomaticRanges: true,
    };

    state = createMockState();
    state.dateFacetSet[facetId] = buildMockDateFacetRequest();

    initDateFacet();
  });

  it('registers a date facet with the passed options', () => {
    const action = registerDateFacet({facetId, ...options});
    expect(engine.actions).toContainEqual(action);
  });

  describe('#toggleSelect', () => {
    it('dispatches a toggleSelectDateFacetValue with the passed value', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);

      const action = toggleSelectDateFacetValue({facetId, selection: value});
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches a search', () => {
      const value = buildMockDateFacetValue();
      dateFacet.toggleSelect(value);

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });

  it('exposes a #state property to retrieve the values', () => {
    const values = [buildMockDateFacetValue()];
    state.search.response.facets = [
      buildMockDateFacetResponse({facetId, values}),
    ];

    expect(dateFacet.state.values).toEqual(values);
  });

  it('#buildDateRange builds a range with the expected required and default values', () => {
    const range = buildDateRange({start: '0', end: '100'});

    expect(range).toEqual({
      start: '0',
      end: '100',
      endInclusive: false,
      state: 'idle',
    });
  });
});
