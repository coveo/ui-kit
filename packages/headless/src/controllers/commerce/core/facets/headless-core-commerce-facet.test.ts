import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {AnyFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  AnyFacetValueResponse,
  RegularFacetResponse,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {AnyFacetValueRequest} from '../../../../features/facets/generic/interfaces/generic-facet-request';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {FacetValueState} from '../../../core/facets/facet/headless-core-facet';
import {commonOptions} from '../../product-listing/facets/headless-product-listing-facet-options';
import {
  buildCoreCommerceFacet,
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
} from './headless-core-commerce-facet';

jest.mock('../../../../features/facets/facet-set/facet-set-actions');
jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('CoreCommerceFacet', () => {
  const facetId = 'facet_id';
  const fetchResultsActionCreator = fetchProductListing;
  const toggleExcludeActionCreator = toggleExcludeFacetValue;
  const toggleSelectActionCreator = toggleSelectFacetValue;
  const field = 'some_field';
  const type = 'regular';
  const displayName = 'Some Facet';
  let options: CoreCommerceFacetOptions;
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let facet: CoreCommerceFacet<AnyFacetValueRequest, AnyFacetValueResponse>;

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
    jest.resetAllMocks();
    options = {
      facetId,
      toggleExcludeActionCreator,
      toggleSelectActionCreator,
      ...commonOptions,
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

    it('dispatches #toggleSelectActionCreatorwith with correct payload', () => {
      facet.toggleSelect(facetValue());
      expect(toggleSelectActionCreator).toHaveBeenCalledWith({
        facetId,
        selection: facetValue(),
      });
    });

    it('dispatches #fetchResultsActionCreator', () => {
      facet.toggleSelect(facetValue());
      expect(fetchResultsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#toggleExclude', () => {
    const facetValue = () => buildMockCommerceRegularFacetValue({});
    describe('when #toggleExcludeActionCreator is undefined', () => {
      beforeEach(() => {
        options = {
          facetId,
          toggleSelectActionCreator,
          ...commonOptions,
        };

        initFacet();
      });

      it('logs a warning', () => {
        jest.spyOn(engine.logger, 'warn');
        facet.toggleExclude(facetValue());

        expect(engine.logger.warn).toHaveBeenCalledTimes(1);
      });

      it('does not dispatch #fetchResultsActionCreator', () => {
        facet.toggleExclude(facetValue());
        expect(fetchResultsActionCreator).not.toHaveBeenCalled();
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

      it('dispatches #fetchResultsActionCreator', () => {
        facet.toggleExclude(facetValue());
        expect(fetchResultsActionCreator).toHaveBeenCalled();
      });
    });
  });

  describe('#toggleSingleSelect', () => {
    describe('when toggled facet value state is "idle"', () => {
      const facetValue = () =>
        buildMockCommerceRegularFacetValue({state: 'idle'});

      it('dispatches #deselectAllFacetValues with correct payload', () => {
        facet.toggleSingleSelect(facetValue());
        expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
      });

      it('calls #toggleSelect', () => {
        jest.spyOn(facet, 'toggleSelect');
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
        jest.spyOn(facet, 'toggleSelect');
        facet.toggleSingleSelect(facetValue());

        expect(facet.toggleSelect).toHaveBeenCalled();
      });

      it('does not dispatch #deselectAllFacetValues', () => {
        facet.toggleSingleSelect(facetValue());
        expect(deselectAllFacetValues).not.toHaveBeenCalled();
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
          ...commonOptions,
        };

        initFacet();
      });

      it('logs a warning', () => {
        jest.spyOn(engine.logger, 'warn');
        facet.toggleSingleExclude(facetValue());

        expect(engine.logger.warn).toHaveBeenCalledTimes(1);
      });

      it('does not dispatch #deselectAllFacetValues', () => {
        facet.toggleSingleExclude(facetValue());
        expect(deselectAllFacetValues).not.toHaveBeenCalled();
      });

      it('does not call #toggleExclude', () => {
        jest.spyOn(facet, 'toggleExclude');
        facet.toggleSingleExclude(facetValue());

        expect(facet.toggleExclude).not.toHaveBeenCalled();
      });
    });

    describe('when #toggleExcludeActionCreator is defined', () => {
      describe('when toggled facet value state is "idle"', () => {
        it('dispatches #deselectAllFacetValues with correct payload', () => {
          facet.toggleSingleExclude(facetValue());

          expect(deselectAllFacetValues).toHaveBeenCalled();
        });

        it('calls #toggleExclude', () => {
          jest.spyOn(facet, 'toggleExclude');
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
          jest.spyOn(facet, 'toggleExclude');
          const excludedFacetValue = buildMockCommerceRegularFacetValue({
            state,
          });

          facet.toggleSingleExclude(excludedFacetValue);
          expect(facet.toggleExclude).toHaveBeenCalled();
        });

        it('does not dispatch #deselectAllFacetValues', () => {
          const excludedFacetValue = buildMockCommerceRegularFacetValue({
            state,
          });

          facet.toggleSingleExclude(excludedFacetValue);
          expect(deselectAllFacetValues).not.toHaveBeenCalled();
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
    it('dispatches #deselectAllFacetValues with correct payload', () => {
      facet.deselectAll();

      expect(deselectAllFacetValues).toHaveBeenCalledWith(facetId);
    });
  });

  describe('#showMoreValues', () => {
    it('dispatches #updateFacetNumberOfValues with the correct payload', () => {
      const numberOfValues = 10;

      setFacetRequest({numberOfValues, initialNumberOfValues: 10});
      setFacetResponse({
        values: [buildMockCommerceRegularFacetValue({state: 'idle'})],
      });
      initFacet();

      facet.showMoreValues();

      expect(updateFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 20,
      });
    });

    it('dispatches #updateFacetIsFieldExpanded with the correct payload', () => {
      facet.showMoreValues();

      expect(updateFacetIsFieldExpanded).toHaveBeenCalledWith({
        facetId,
        isFieldExpanded: true,
      });
    });

    it('dispatches #fetchResultsActionCreator', () => {
      facet.showMoreValues();
      expect(fetchResultsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#showLessValues', () => {
    it('when number of active values is less than initial number of values, dispatches #updateFacetNumberOfValues with numberOfValues: <initial number of value> in payload', () => {
      const activeValues = [
        buildMockCommerceRegularFacetValue({
          state: 'selected',
        }),
      ];
      const initialNumberOfValues = activeValues.length + 1;
      setFacetRequest({
        initialNumberOfValues,
        values: activeValues,
      });
      initFacet();

      facet.showLessValues();

      expect(updateFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: initialNumberOfValues,
      });
    });

    it('when number of active values is greater than initial number of values, dispatches #updateFacetNumberOfValues with numberOfValues: <number of active values> in payload', () => {
      const activeValues = [
        buildMockCommerceRegularFacetValue({state: 'selected'}),
        buildMockCommerceRegularFacetValue({state: 'selected'}),
      ];
      const initialNumberOfValues = activeValues.length - 1;
      setFacetRequest({
        initialNumberOfValues,
        values: activeValues,
      });
      initFacet();
      facet.showLessValues();

      expect(updateFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: activeValues.length,
      });
    });

    it('dispatches #updateFacetIsFieldExpanded with isFieldExpanded: false payload', () => {
      facet.showLessValues();

      expect(updateFacetIsFieldExpanded).toHaveBeenCalledWith({
        facetId,
        isFieldExpanded: false,
      });
    });

    it('dispatches #fetchResultsActionCreator', () => {
      facet.showLessValues();
      expect(fetchResultsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#state', () => {
    it('#facetId exposes the facetId', () => {
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
      it('when the number of currentValues is equal to the configured number, returns "false"', () => {
        const values = [buildMockCommerceRegularFacetValue()];
        setFacetRequest({values, initialNumberOfValues: 1, numberOfValues: 1});
        setFacetResponse({
          values: [buildMockCommerceRegularFacetValue({value: 'Some Value'})],
        });

        initFacet();

        expect(facet.state.canShowLessValues).toBe(false);
      });

      it('when the number of currentValues is greater than the configured number, returns "true"', () => {
        const value = buildMockCommerceRegularFacetValue();

        setFacetRequest({values: [value, value]});
        setFacetResponse({
          values: [buildMockCommerceRegularFacetValue({value: 'Some Value'})],
        });
        initFacet();

        expect(facet.state.canShowLessValues).toBe(true);
      });

      it('when number of currentValues > configured number and there are no idle values, returns "false"', () => {
        const selectedValue = buildMockCommerceRegularFacetValue({
          state: 'selected',
        });

        setFacetRequest({values: [selectedValue, selectedValue]});
        setFacetResponse({
          values: [buildMockCommerceRegularFacetValue({value: 'Some Value'})],
        });
        initFacet();

        expect(facet.state.canShowLessValues).toBe(false);
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
