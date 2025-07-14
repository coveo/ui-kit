import type {CoreEngine} from '../../../../app/engine.js';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from '../../../../features/facet-options/facet-options-actions.js';
import {deselectAllFacetValues} from '../../../../features/facets/facet-set/facet-set-actions.js';
import {updateRangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/range-facet-actions.js';
import type {NumericFacetRequest} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request.js';
import type {SearchAppState} from '../../../../state/search-app-state.js';
import type {
  ConfigurationSection,
  FacetOptionsSection,
  SearchSection,
} from '../../../../state/state-sections.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetResponse} from '../../../../test/mock-numeric-facet-response.js';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value.js';
import {createMockState} from '../../../../test/mock-state.js';
import {
  buildCoreRangeFacet,
  type RangeFacet,
  type RangeFacetProps,
} from './headless-core-range-facet.js';

vi.mock('../../../../features/facet-options/facet-options-actions');
vi.mock('../../../../features/facets/facet-set/facet-set-actions');
vi.mock('../../../../features/facets/range-facets/generic/range-facet-actions');

describe('RangeFacet', () => {
  const facetId = '1';
  let state: SearchAppState;
  let engine: MockedSearchEngine;
  let props: RangeFacetProps<NumericFacetRequest>;
  let rangeFacet: RangeFacet;

  function initRangeFacet() {
    engine = buildMockSearchEngine(state);
    rangeFacet = buildCoreRangeFacet(
      engine as CoreEngine<
        ConfigurationSection & SearchSection & FacetOptionsSection
      >,
      props
    );
  }

  beforeEach(() => {
    vi.resetAllMocks();
    props = {
      facetId,
      getRequest: () => buildMockNumericFacetRequest(),
    };

    state = createMockState();
    initRangeFacet();
  });

  it('#subscribe method should be defined', () => {
    expect(rangeFacet.subscribe).toBeDefined();
  });

  describe('#isValueSelected', () => {
    it('should return true when the passed value is selected in the facet', () => {
      const selectedValue = buildMockNumericFacetValue({state: 'selected'});

      expect(rangeFacet.isValueSelected(selectedValue)).toBe(true);
    });

    it('should return false when the passed value is not selected in the facet', () => {
      const idleValue = buildMockNumericFacetValue({state: 'idle'});
      const excludedValue = buildMockNumericFacetValue({state: 'excluded'});

      expect(rangeFacet.isValueSelected(idleValue)).toBe(false);
      expect(rangeFacet.isValueSelected(excludedValue)).toBe(false);
    });
  });

  describe('#isValueExcluded', () => {
    it('should return true when the passed value is excluded in the facet', () => {
      const excludedValue = buildMockNumericFacetValue({state: 'excluded'});

      expect(rangeFacet.isValueExcluded(excludedValue)).toBe(true);
    });

    it('should return false when the passed value is not selected in the facet', () => {
      const idleValue = buildMockNumericFacetValue({state: 'idle'});
      const selectedValue = buildMockNumericFacetValue({state: 'selected'});

      expect(rangeFacet.isValueExcluded(idleValue)).toBe(false);
      expect(rangeFacet.isValueExcluded(selectedValue)).toBe(false);
    });
  });

  describe('#deselectAll', () => {
    beforeEach(() => rangeFacet.deselectAll());

    it('should dispatch the #deselectAllFacetValues action with the facetId', () => {
      expect(deselectAllFacetValues).toHaveBeenCalledExactlyOnceWith(facetId);
    });

    it('should dispatch the #updateFacetOptions action', () => {
      expect(updateFacetOptions).toHaveBeenCalledOnce();
    });
  });

  describe('#sortBy', () => {
    it("should dispatch the #updateRangeFacetSortCriterion action with the facet's ID and sort crition", () => {
      const criterion = 'descending';

      rangeFacet.sortBy(criterion);

      expect(updateRangeFacetSortCriterion).toHaveBeenCalledExactlyOnceWith({
        facetId,
        criterion,
      });
    });

    it('should dispatch the #updateFacetOptions action', () => {
      rangeFacet.sortBy('descending');

      expect(updateFacetOptions).toHaveBeenCalledOnce();
    });
  });

  describe('#isSortedBy', () => {
    it("should return true when the passed criterion matches the facet's active sort criterion", () => {
      const criterion = 'descending';
      props.getRequest = () =>
        buildMockNumericFacetRequest({sortCriteria: criterion});
      initRangeFacet();

      expect(rangeFacet.isSortedBy(criterion)).toBe(true);
    });

    it("should return false when the passed criterion does not match the facet's active sort criterion", () => {
      const criterion = 'descending';
      props.getRequest = () =>
        buildMockNumericFacetRequest({sortCriteria: 'ascending'});
      initRangeFacet();

      expect(rangeFacet.isSortedBy(criterion)).toBe(false);
    });
  });

  describe('#enable', () => {
    it('should dispatch the #enableFacet action with the facetId', () => {
      rangeFacet.enable();

      expect(enableFacet).toHaveBeenCalledExactlyOnceWith(facetId);
    });
  });

  describe('#disable', () => {
    it('should dispatch the #disableFacet action with the facetId', () => {
      rangeFacet.disable();

      expect(disableFacet).toHaveBeenCalledExactlyOnceWith(facetId);
    });
  });

  describe('#state', () => {
    describe('.facetId', () => {
      it('should expose the facetId', () => {
        expect(rangeFacet.state.facetId).toBe(facetId);
      });
    });

    describe('.values', () => {
      it('should expose the value from the response when the response is defined', () => {
        const values = [buildMockNumericFacetValue()];
        const facet = buildMockNumericFacetResponse({facetId, values});
        state.search.response.facets = [facet];
        initRangeFacet();

        expect(rangeFacet.state.values).toEqual(values);
      });

      it('should expose an empty array when the response is not defined', () => {
        initRangeFacet();

        expect(rangeFacet.state.values).toEqual([]);
      });
    });

    describe('.sortCriterion', () => {
      it('should expose the sortCriteria from the request', () => {
        const criterion = 'descending';
        props.getRequest = () =>
          buildMockNumericFacetRequest({sortCriteria: criterion});
        initRangeFacet();

        expect(rangeFacet.state.sortCriterion).toBe(criterion);
      });
    });

    describe('.resultsMustMatch', () => {
      it('should expose the resultsMustMatch value from the request', () => {
        const resultsMustMatch = 'allValues';
        props.getRequest = () =>
          buildMockNumericFacetRequest({resultsMustMatch});
        initRangeFacet();

        expect(rangeFacet.state.resultsMustMatch).toBe(resultsMustMatch);
      });
    });

    describe('.hasActiveValues', () => {
      it('should be true when #state.values has a value with a non-idle state', () => {
        const values = [buildMockNumericFacetValue({state: 'selected'})];
        const response = buildMockNumericFacetResponse({facetId, values});
        state.search.response.facets = [response];

        expect(rangeFacet.state.hasActiveValues).toBe(true);

        values.pop();
        values.push(buildMockNumericFacetValue({state: 'excluded'}));
        state.search.response.facets = [
          buildMockNumericFacetResponse({facetId, values}),
        ];

        expect(rangeFacet.state.hasActiveValues).toBe(true);
      });

      it('should be false when #state.values only has idle values', () => {
        const values = [buildMockNumericFacetValue({state: 'idle'})];
        const response = buildMockNumericFacetResponse({facetId, values});
        state.search.response.facets = [response];

        expect(rangeFacet.state.hasActiveValues).toBe(false);
      });

      it('should be false when #state.values is an empty array', () => {
        expect(rangeFacet.state.hasActiveValues).toBe(false);
      });
    });

    describe('.isLoading', () => {
      it('should be true when search is loading', () => {
        state.search.isLoading = true;
        initRangeFacet();

        expect(rangeFacet.state.isLoading).toBe(true);
      });

      it('should be false when search is not loading', () => {
        state.search.isLoading = false;
        initRangeFacet();

        expect(rangeFacet.state.isLoading).toBe(false);
      });
    });

    describe('.enabled', () => {
      it('should be true when the facet is enabled', () => {
        state.facetOptions.facets[facetId] = {enabled: true};
        initRangeFacet();

        expect(rangeFacet.state.enabled).toBe(true);
      });

      it('should be false when the facet is disabled', () => {
        state.facetOptions.facets[facetId] = {enabled: false};
        initRangeFacet();

        expect(rangeFacet.state.enabled).toBe(false);
      });
    });

    describe('.domain', () => {
      it('should expose the domain from the response when the response is defined', () => {
        const domain = {start: 10, end: 50};
        const facet = buildMockNumericFacetResponse({facetId, domain});
        state.search.response.facets = [facet];
        initRangeFacet();

        expect(rangeFacet.state.domain).toEqual(domain);
      });

      it('should expose an undefined domain when the response is not defined', () => {
        initRangeFacet();

        expect(rangeFacet.state.domain).toBeUndefined();
      });
    });
  });
});
