import {
  deselectAllValuesInCoreFacet,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
} from '../../../../features/commerce/facets/core-facet/core-facet-actions';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {AnyFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {RegularFacetResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../features/commerce/facets/regular-facet/regular-facet-actions';
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
import {
  buildCoreCommerceFacet,
  CoreCommerceFacetOptions,
} from './headless-core-commerce-facet';

jest.mock('../../../../features/commerce/facets/core-facet/core-facet-actions');
jest.mock(
  '../../../../features/commerce/facets/regular-facet/regular-facet-actions'
);

describe('CoreCommerceFacet', () => {
  const facetId = 'facet_id';
  const fetchProductsActionCreator = jest.fn();
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
    jest.resetAllMocks();
    options = {
      facetId,
      toggleExcludeActionCreator,
      toggleSelectActionCreator,
      fetchProductsActionCreator,
      facetResponseSelector: jest.fn(),
      isFacetLoadingResponseSelector: jest.fn(),
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

    it('sets retrieveCount when provided in selection', () => {
      const selection = {
        ...facetValue(),
        retrieveCount: 30,
      };
      facet.toggleSelect(selection);
      expect(toggleSelectActionCreator).toHaveBeenCalledWith({
        facetId,
        selection,
        retrieveCount: 30,
      });
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
          facetResponseSelector: jest.fn(),
          isFacetLoadingResponseSelector: jest.fn(),
        };

        initFacet();
      });

      it('logs a warning', () => {
        jest.spyOn(engine.logger, 'warn');
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
          facetResponseSelector: jest.fn(),
          isFacetLoadingResponseSelector: jest.fn(),
        };

        initFacet();
      });

      it('logs a warning', () => {
        jest.spyOn(engine.logger, 'warn');
        facet.toggleSingleExclude(facetValue());

        expect(engine.logger.warn).toHaveBeenCalledTimes(1);
      });

      it('does not dispatch #deselectAllValuesInCoreFacet', () => {
        facet.toggleSingleExclude(facetValue());
        expect(deselectAllValuesInCoreFacet).not.toHaveBeenCalled();
      });

      it('does not call #toggleExclude', () => {
        jest.spyOn(facet, 'toggleExclude');
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
    it('dispatches #updateCoreFacetNumberOfValues with the correct payload', () => {
      const numberOfValues = 10;

      setFacetRequest({numberOfValues, initialNumberOfValues: 10});
      setFacetResponse({
        values: [buildMockCommerceRegularFacetValue({state: 'idle'})],
      });
      initFacet();

      facet.showMoreValues();

      expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: 20,
      });
    });

    it('dispatches #updateCoreFacetIsFieldExpanded with the correct payload', () => {
      facet.showMoreValues();

      expect(updateCoreFacetIsFieldExpanded).toHaveBeenCalledWith({
        facetId,
        isFieldExpanded: true,
      });
    });

    it('dispatches #fetchProductsActionCreator', () => {
      facet.showMoreValues();
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#showLessValues', () => {
    it('when number of active values is less than initial number of values, dispatches #updateCoreFacetNumberOfValues with numberOfValues: <initial number of value> in payload', () => {
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

      expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: initialNumberOfValues,
      });
    });

    it('when number of active values is greater than initial number of values, dispatches #updateCoreFacetNumberOfValues with numberOfValues: <number of active values> in payload', () => {
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

      expect(updateCoreFacetNumberOfValues).toHaveBeenCalledWith({
        facetId,
        numberOfValues: activeValues.length,
      });
    });

    it('dispatches #updateCoreFacetIsFieldExpanded with isFieldExpanded: false payload', () => {
      facet.showLessValues();

      expect(updateCoreFacetIsFieldExpanded).toHaveBeenCalledWith({
        facetId,
        isFieldExpanded: false,
      });
    });

    it('dispatches #fetchProductsActionCreator', () => {
      facet.showLessValues();
      expect(fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#state', () => {
    it('#facetId exposes the facetId passed as an option to the controller', () => {
      state.commerceFacetSet = {};
      options.facetResponseSelector = jest.fn();
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
