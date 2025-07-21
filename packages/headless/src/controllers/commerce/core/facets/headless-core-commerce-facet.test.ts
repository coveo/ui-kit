import {
  deselectAllValuesInCoreFacet,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
} from '../../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice.js';
import type {AnyFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request.js';
import type {RegularFacetResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../features/commerce/facets/regular-facet/regular-facet-actions.js';
import type {CommerceAppState} from '../../../../state/commerce-app-state.js';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request.js';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response.js';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice.js';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import type {FacetValueState} from '../../../core/facets/facet/headless-core-facet.js';
import {
  buildCoreCommerceFacet,
  type CoreCommerceFacetOptions,
} from './headless-core-commerce-facet.js';

vi.mock('../../../../features/commerce/facets/core-facet/core-facet-actions');
vi.mock(
  '../../../../features/commerce/facets/regular-facet/regular-facet-actions'
);

describe('CoreCommerceFacet', () => {
  const facetId = 'facet_id';
  const fetchProductsActionCreator = vi.fn();
  const toggleExcludeActionCreator = toggleExcludeFacetValue;
  const toggleSelectActionCreator = toggleSelectFacetValue;
  const field = 'some_field';
  const type = 'regular';
  const displayName = 'Some Facet';
  let options: CoreCommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: ReturnType<typeof buildCoreCommerceFacet>;

  function initFacet() {
    engine = buildMockCommerceEngine(state);
    facet = buildCoreCommerceFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<AnyFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, field, type, ...config}),
    });
  }

  function setFacetResponse(config: Partial<RegularFacetResponse> = {}) {
    options.facetResponseSelector = () =>
      buildMockCommerceRegularFacetResponse({
        facetId,
        field,
        type,
        displayName,
        ...config,
      });
  }

  beforeEach(() => {
    vi.resetAllMocks();
    options = {
      facetId,
      toggleExcludeActionCreator,
      toggleSelectActionCreator,
      fetchProductsActionCreator,
      facetResponseSelector: vi.fn(),
      isFacetLoadingResponseSelector: vi.fn(),
    };

    state = buildMockCommerceState();
    setFacetRequest();
    setFacetResponse();

    initFacet();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(facet).toBeTruthy();
    });

    it('adds #commerceFacetSet reducer to engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        commerceFacetSet,
      });
    });

    it('exposes #subscribe method', () => {
      expect(facet.subscribe).toBeTruthy();
    });
  });

  describe('#toggleSelect', () => {
    const facetValue = () => buildMockCommerceRegularFacetValue({});

    it('dispatches #toggleSelectActionCreator with correct payload', () => {
      facet.toggleSelect(facetValue());
      expect(toggleSelectActionCreator).toHaveBeenCalledWith({
        facetId,
        selection: facetValue(),
      });
    });

    it('dispatches #fetchProductsActionCreator', () => {
      facet.toggleSelect(facetValue());
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#toggleExclude', () => {
    const facetValue = () => buildMockCommerceRegularFacetValue({});
    describe('when #toggleExcludeActionCreator is undefined', () => {
      beforeEach(() => {
        options = {
          facetId,
          toggleSelectActionCreator,
          fetchProductsActionCreator,
          facetResponseSelector: vi.fn(),
          isFacetLoadingResponseSelector: vi.fn(),
        };

        initFacet();
      });

      it('logs a warning', () => {
        vi.spyOn(engine.logger, 'warn');
        facet.toggleExclude(facetValue());

        expect(engine.logger.warn).toHaveBeenCalledTimes(1);
      });

      it('does not dispatch #fetchProductsActionCreator', () => {
        facet.toggleExclude(facetValue());
        expect(fetchProductsActionCreator).not.toHaveBeenCalled();
      });
    });

    describe('when #toggleExcludeActionCreator is defined', () => {
      it('dispatches #toggleExcludeActionCreator with correct payload', () => {
        facet.toggleExclude(facetValue());
        expect(toggleExcludeActionCreator).toHaveBeenCalledWith({
          facetId,
          selection: facetValue(),
        });
      });

      it('dispatches #fetchProductsActionCreator', () => {
        facet.toggleExclude(facetValue());
        expect(fetchProductsActionCreator).toHaveBeenCalled();
      });
    });
  });

  describe('#toggleSingleSelect', () => {
    describe('when toggled facet value state is "idle"', () => {
      const facetValue = () =>
        buildMockCommerceRegularFacetValue({state: 'idle'});

      it('dispatches #deselectAllValuesInCoreFacet with correct payload', () => {
        facet.toggleSingleSelect(facetValue());
        expect(deselectAllValuesInCoreFacet).toHaveBeenCalledWith({facetId});
      });

      it('calls #toggleSelect', () => {
        vi.spyOn(facet, 'toggleSelect');
        facet.toggleSingleSelect(facetValue());

        expect(facet.toggleSelect).toHaveBeenCalled();
      });
    });

    describe.each([
      {
        state: 'excluded' as FacetValueState,
      },
      {
        state: 'selected' as FacetValueState,
      },
    ])('when toggled facet value state is $state', ({state}) => {
      const facetValue = () => buildMockCommerceRegularFacetValue({state});

      it('calls #toggleSelect', () => {
        vi.spyOn(facet, 'toggleSelect');
        facet.toggleSingleSelect(facetValue());

        expect(facet.toggleSelect).toHaveBeenCalled();
      });

      it('does not dispatch #deselectAllValuesInCoreFacet', () => {
        facet.toggleSingleSelect(facetValue());
        expect(deselectAllValuesInCoreFacet).not.toHaveBeenCalled();
      });
    });
  });

  describe('#toggleSingleExclude', () => {
    const facetValue = () =>
      buildMockCommerceRegularFacetValue({state: 'idle'});
    describe('when #toggleExcludeActionCreator is undefined', () => {
      beforeEach(() => {
        options = {
          facetId,
          toggleSelectActionCreator,
          fetchProductsActionCreator,
          facetResponseSelector: vi.fn(),
          isFacetLoadingResponseSelector: vi.fn(),
        };

        initFacet();
      });

      it('logs a warning', () => {
        vi.spyOn(engine.logger, 'warn');
        facet.toggleSingleExclude(facetValue());

        expect(engine.logger.warn).toHaveBeenCalledTimes(1);
      });

      it('does not dispatch #deselectAllValuesInCoreFacet', () => {
        facet.toggleSingleExclude(facetValue());
        expect(deselectAllValuesInCoreFacet).not.toHaveBeenCalled();
      });

      it('does not call #toggleExclude', () => {
        vi.spyOn(facet, 'toggleExclude');
        facet.toggleSingleExclude(facetValue());

        expect(facet.toggleExclude).not.toHaveBeenCalled();
      });
    });

    describe('when #toggleExcludeActionCreator is defined', () => {
      describe('when toggled facet value state is "idle"', () => {
        it('dispatches #deselectAllValuesInCoreFacet with correct payload', () => {
          facet.toggleSingleExclude(facetValue());

          expect(deselectAllValuesInCoreFacet).toHaveBeenCalledWith({facetId});
        });

        it('calls #toggleExclude', () => {
          vi.spyOn(facet, 'toggleExclude');
          facet.toggleSingleExclude(facetValue());

          expect(facet.toggleExclude).toHaveBeenCalled();
        });
      });

      describe.each([
        {
          state: 'excluded' as FacetValueState,
        },
        {
          state: 'selected' as FacetValueState,
        },
      ])('when toggled facet value state is $state', ({state}) => {
        it('calls #toggleExclude', () => {
          vi.spyOn(facet, 'toggleExclude');
          const excludedFacetValue = buildMockCommerceRegularFacetValue({
            state,
          });

          facet.toggleSingleExclude(excludedFacetValue);
          expect(facet.toggleExclude).toHaveBeenCalled();
        });

        it('does not dispatch #deselectAllValuesInCoreFacet', () => {
          const excludedFacetValue = buildMockCommerceRegularFacetValue({
            state,
          });

          facet.toggleSingleExclude(excludedFacetValue);
          expect(deselectAllValuesInCoreFacet).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('#isValueSelected', () => {
    it.each([
      {state: 'selected', expected: true},
      {state: 'excluded', expected: false},
      {state: 'idle', expected: false},
    ])(
      'when passed value state is "$state", returns $expected',
      ({state, expected}) => {
        const facetValue = buildMockCommerceRegularFacetValue({
          state: state as FacetValueState,
        });
        expect(facet.isValueSelected(facetValue)).toBe(expected);
      }
    );
  });

  describe('#isValueExcluded', () => {
    it.each([
      {state: 'selected', expected: false},
      {state: 'excluded', expected: true},
      {state: 'idle', expected: false},
    ])(
      'when passed value state is "$state", returns $expected',
      ({state, expected}) => {
        const facetValue = buildMockCommerceRegularFacetValue({
          state: state as FacetValueState,
        });
        expect(facet.isValueExcluded(facetValue)).toBe(expected);
      }
    );
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllValuesInCoreFacet with correct payload', () => {
      facet.deselectAll();

      expect(deselectAllValuesInCoreFacet).toHaveBeenCalledWith({facetId});
    });
  });

  describe('#showMoreValues', () => {
    it('should dispatch #updateCoreFacetNumberOfValues with the correct arguments', () => {
      setFacetRequest({numberOfValues: 4, initialNumberOfValues: 4});
      initFacet();

      facet.showMoreValues();

      expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 8,
      });
    });

    it('should dispatch #updateCoreFacetIsFieldExpanded with the correct arguments', () => {
      facet.showMoreValues();

      expect(updateCoreFacetIsFieldExpanded).toHaveBeenCalledWith({
        facetId,
        isFieldExpanded: true,
      });
    });

    it('should dispatch #fetchProductsActionCreator', () => {
      facet.showMoreValues();

      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });

    describe('when dispatching #updateCoreFacetNumberOfValues', () => {
      it('should set numberOfValues in the payload to the initial number of values when the current number of values is undefined', () => {
        setFacetRequest({initialNumberOfValues: 4, numberOfValues: undefined});
        initFacet();

        facet.showMoreValues();

        expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
          facetId,
          numberOfValues: 4,
        });
      });

      it('should set numberOfValues in the payload to the number of values + 1 when the initial number of values is undefined', () => {
        setFacetRequest({numberOfValues: 4, initialNumberOfValues: undefined});
        initFacet();

        facet.showMoreValues();

        expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
          facetId,
          numberOfValues: 5,
        });
      });

      it('should set numberOfValues in the payload to the next multiple of the initial number of values when the number of values is not a multiple of the initial number of values', () => {
        setFacetRequest({numberOfValues: 5, initialNumberOfValues: 4});
        initFacet();

        facet.showMoreValues();

        expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
          facetId,
          numberOfValues: 8,
        });
      });

      it('should set numberOfValues in the payload to the next multiple of the initial number of values when the number of values is a multiple of the initial number of values', () => {
        setFacetRequest({numberOfValues: 8, initialNumberOfValues: 4});
        initFacet();

        facet.showMoreValues();

        expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
          facetId,
          numberOfValues: 12,
        });
      });
    });
  });

  describe('#showLessValues', () => {
    it('should dispatch #updateCoreFacetNumberOfValues with the correct payload', () => {
      const value = buildMockCommerceRegularFacetValue();
      setFacetRequest({
        values: [value, value, value, value, value, value, value, value],
        initialNumberOfValues: 4,
      });
      initFacet();

      facet.showLessValues();

      expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 4,
      });
    });

    it('should dispatch #updateCoreFacetIsFieldExpanded with the correct payload', () => {
      facet.showLessValues();

      expect(updateCoreFacetIsFieldExpanded).toHaveBeenCalledWith({
        facetId,
        isFieldExpanded: false,
      });
    });

    it('should dispatch #fetchProductsActionCreator', () => {
      facet.showLessValues();

      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });

    describe('when dispatching #updateCoreFacetNumberOfValues', () => {
      it('should set numberOfValues in the payload to the number of non-idle values when the initial number of values in undefined', () => {
        const value = buildMockCommerceRegularFacetValue();
        const selectedValue = buildMockCommerceRegularFacetValue({
          state: 'selected',
        });
        setFacetRequest({
          values: [value, value, value, selectedValue, selectedValue],
          initialNumberOfValues: undefined,
        });
        initFacet();

        facet.showLessValues();

        expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
          facetId,
          numberOfValues: 2,
        });
      });

      it('should set numberOfValues in the payload to the initial number of values when the initial number of values is greater than the number of non-idle values', () => {
        const selectedValue = buildMockCommerceRegularFacetValue({
          state: 'selected',
        });
        const value = buildMockCommerceRegularFacetValue();
        setFacetRequest({
          values: [selectedValue, value, value, value],
          initialNumberOfValues: 2,
        });
        initFacet();

        facet.showLessValues();

        expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
          facetId,
          numberOfValues: 2,
        });
      });

      it('should set numberOfValues in the payload to the initial number of values when the initial number of values is less than the number of non-idle values', () => {
        const selectedValue = buildMockCommerceRegularFacetValue({
          state: 'selected',
        });
        const value = buildMockCommerceRegularFacetValue();
        setFacetRequest({
          values: [selectedValue, selectedValue, selectedValue, value],
          initialNumberOfValues: 2,
        });
        initFacet();

        facet.showLessValues();

        expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
          facetId,
          numberOfValues: 3,
        });
      });
    });
  });

  describe('#state', () => {
    it('#facetId exposes the facetId passed as an option to the controller', () => {
      state.commerceFacetSet = {};
      options.facetResponseSelector = vi.fn();
      expect(facet.state.facetId).toBe(facetId);
    });

    it('#type exposes the type', () => {
      expect(facet.state.type).toBe(type);
    });

    it('#field exposes the field', () => {
      expect(facet.state.field).toBe(field);
    });

    it('#displayName exposes the displayName', () => {
      expect(facet.state.displayName).toBe(displayName);
    });

    it('#values uses #facetResponseSelector', () => {
      const values = [buildMockCommerceRegularFacetValue()];
      options = {
        ...options,
        facetResponseSelector: () =>
          buildMockCommerceRegularFacetResponse({
            facetId,
            values,
          }),
      };
      initFacet();

      expect(facet.state.values).toBe(values);
    });

    it('#isLoading uses #isFacetLoadingResponseSelector', () => {
      options = {
        ...options,
        isFacetLoadingResponseSelector: () => true,
      };
      initFacet();
      expect(facet.state.isLoading).toBe(true);
    });

    describe('#canShowMoreValues', () => {
      it('when there is no response, returns "false"', () => {
        expect(facet.state.canShowMoreValues).toBe(false);
      });

      it('when #moreValuesAvailable in the response is "true", returns "true"', () => {
        setFacetResponse(
          buildMockCommerceRegularFacetResponse({
            facetId,
            moreValuesAvailable: true,
          })
        );
        initFacet();

        expect(facet.state.canShowMoreValues).toBe(true);
      });

      it('when #moreValuesAvailable in the response is "false", returns "false"', () => {
        setFacetResponse(
          buildMockCommerceRegularFacetResponse({
            facetId,
            moreValuesAvailable: false,
          })
        );
        initFacet();

        expect(facet.state.canShowMoreValues).toBe(false);
      });
    });
    describe('#canShowLessValues', () => {
      it("should be 'false' then the request is undefined", () => {
        setFacetRequest(undefined);
        initFacet();

        expect(facet.state.canShowLessValues).toBe(false);
      });

      it("should be'false' when the length of the values is less than the initial number of values", () => {
        const value = buildMockCommerceRegularFacetValue();
        setFacetRequest({
          values: [value],
          initialNumberOfValues: 2,
        });
        initFacet();

        expect(facet.state.canShowLessValues).toBe(false);
      });

      it("should be 'false' when the length of the values is equal to the initial number of values", () => {
        const value = buildMockCommerceRegularFacetValue();
        setFacetRequest({
          values: [value, value],
          initialNumberOfValues: 2,
        });
        initFacet();

        expect(facet.state.canShowLessValues).toBe(false);
      });

      it("should be 'false' when none of the values in the request are idle", () => {
        const selectedValue = buildMockCommerceRegularFacetValue({
          state: 'selected',
        });
        setFacetRequest({
          values: [selectedValue, selectedValue, selectedValue, selectedValue],
          initialNumberOfValues: 2,
        });
        initFacet();

        expect(facet.state.canShowLessValues).toBe(false);
      });

      it("should be 'false' when the length of the values is 1 and the initial number of values is undefined", () => {
        const value = buildMockCommerceRegularFacetValue();
        setFacetRequest({
          values: [value],
          initialNumberOfValues: undefined,
        });
        initFacet();

        expect(facet.state.canShowLessValues).toBe(false);
      });

      it("should be 'true' when the number of idle values is greater than 1 and the initial number of values is undefined", () => {
        const value = buildMockCommerceRegularFacetValue();
        const selectedValue = buildMockCommerceRegularFacetValue({
          state: 'selected',
        });
        setFacetRequest({
          values: [selectedValue, selectedValue, value],
          initialNumberOfValues: undefined,
        });
        initFacet();

        expect(facet.state.canShowLessValues).toBe(true);
      });

      it("should be 'true' when the length of the values in the request is greater than the initial number of values and there is at least one idle value", () => {
        const value = buildMockCommerceRegularFacetValue();
        const selectedValue = buildMockCommerceRegularFacetValue({
          state: 'selected',
        });
        setFacetRequest({
          values: [selectedValue, selectedValue, selectedValue, value],
          initialNumberOfValues: 2,
        });

        initFacet();

        expect(facet.state.canShowLessValues).toBe(true);
      });
    });

    describe('#hasActiveValues', () => {
      it('when there are no values, returns "false"', () => {
        setFacetResponse({values: []});
        initFacet();

        expect(facet.state.hasActiveValues).toBe(false);
      });

      it('when there is at least one value with state "selected", returns "true"', () => {
        setFacetResponse({
          values: [
            buildMockCommerceRegularFacetValue({state: 'selected'}),
            buildMockCommerceRegularFacetValue({state: 'idle'}),
          ],
        });
        initFacet();

        expect(facet.state.hasActiveValues).toBe(true);
      });

      it('when there is at least one value with state "excluded", returns "true"', () => {
        setFacetResponse({
          values: [
            buildMockCommerceRegularFacetValue({state: 'excluded'}),
            buildMockCommerceRegularFacetValue({state: 'idle'}),
          ],
        });
        initFacet();

        expect(facet.state.hasActiveValues).toBe(true);
      });

      it('when all values have state "idle", returns "false"', () => {
        setFacetResponse({
          values: [
            buildMockCommerceRegularFacetValue({state: 'idle'}),
            buildMockCommerceRegularFacetValue({state: 'idle'}),
          ],
        });
        initFacet();

        expect(facet.state.hasActiveValues).toBe(false);
      });
    });
  });
});
