import {
  DateFacet,
  buildDateFacet,
  DateFacetOptions,
} from './headless-date-facet';
import {
  MockEngine,
  buildMockSearchAppEngine,
} from '../../../../test/mock-engine';
import {createMockState} from '../../../../test/mock-state';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildMockDateFacetResponse} from '../../../../test/mock-date-facet-response';
import {SearchAppState} from '../../../../state/search-app-state';
import * as FacetIdDeterminor from '../../_common/facet-id-determinor';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request';

describe('date facet', () => {
  const facetId = '1';
  let options: DateFacetOptions;
  let state: SearchAppState;
  let engine: MockEngine<SearchAppState>;
  let dateFacet: DateFacet;

  function initDateFacet() {
    engine = buildMockSearchAppEngine({state});
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

  it('calls #determineFacetId with the correct params', () => {
    jest.spyOn(FacetIdDeterminor, 'determineFacetId');

    initDateFacet();

    expect(FacetIdDeterminor.determineFacetId).toHaveBeenCalledWith(
      engine,
      options
    );
  });

  it('registers a date facet with the passed options', () => {
    const action = registerDateFacet({facetId, currentValues: [], ...options});
    expect(engine.actions).toContainEqual(action);
  });

  it('when an option is invalid, it throws an error', () => {
    options.numberOfValues = 0;
    expect(() => initDateFacet()).toThrow(
      'Check the options of buildDateFacet'
    );
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

  it('exposes a #state getter property to retrieve the values', () => {
    const values = [buildMockDateFacetValue()];
    state.search.response.facets = [
      buildMockDateFacetResponse({facetId, values}),
    ];

    expect(dateFacet.state.values).toEqual(values);
  });
});
