import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
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
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceRegularFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceRegularFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {FacetValueState} from '../../../core/facets/facet/headless-core-facet';
import {
  buildCoreCommerceFacet,
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
} from './headless-core-commerce-facet';

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
  let engine: MockCommerceEngine;
  let facet: CoreCommerceFacet<AnyFacetValueRequest, AnyFacetValueResponse>;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCoreCommerceFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, field, type, ...config}),
    });
  }

  function setFacetResponse(config: Partial<RegularFacetResponse> = {}) {
    state.productListing.facets = [
      buildMockCommerceRegularFacetResponse({
        facetId,
        field,
        type,
        displayName,
        ...config,
      }),
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
      fetchResultsActionCreator,
      toggleExcludeActionCreator,
      toggleSelectActionCreator,
    };

    state = buildMockCommerceState();
    setFacetRequest();
    setFacetResponse();

    initFacet();
  });

  it('initializes', () => {
    expect(facet).toBeTruthy();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceFacetSet,
    });
  });

  it('exposes #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  describe('#toggleSelect', () => {
    const facetValue = () => buildMockCommerceRegularFacetValue({value: 'TED'});

    it('dispatches #toggleSelectActionCreatorwith the passed facet value', () => {
      facet.toggleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        toggleSelectActionCreator({facetId, selection: facetValue()})
      );
    });

    it('dispatches #fetchResultsActionCreator', () => {
      facet.toggleSelect(facetValue());

      const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
      expect(action).toBeTruthy();
    });
  });

  describe('#toggleExclude', () => {
    const facetValue = () => buildMockCommerceRegularFacetValue({value: 'TED'});

    it('dispatches #toggleExcludeActionCreator with the passed facet value', () => {
      facet.toggleExclude(facetValue());

      expect(engine.actions).toContainEqual(
        toggleExcludeActionCreator({facetId, selection: facetValue()})
      );
    });

    it('dispatches #fetchResultsActionCreator', () => {
      facet.toggleExclude(facetValue());

      const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
      expect(action).toBeTruthy();
    });
  });

  describe('#toggleSingleSelect', () => {
    describe('when toggled facet value state is "idle"', () => {
      const facetValue = () =>
        buildMockCommerceRegularFacetValue({value: 'TED', state: 'idle'});
      it('dispatches #toggleSelectActionCreator with the passed facet value', () => {
        facet.toggleSingleSelect(facetValue());

        expect(engine.actions).toContainEqual(
          toggleSelectActionCreator({facetId, selection: facetValue()})
        );
      });

      it('dispatches #fetchResultsActionCreator', () => {
        facet.toggleSingleSelect(facetValue());

        const action = engine.findAsyncAction(
          fetchResultsActionCreator.pending
        );
        expect(action).toBeTruthy();
      });

      it('dispatches the #deselectAllFacetValues action with the facetId', () => {
        facet.toggleSingleSelect(facetValue());

        expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
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
      const facetValue = () =>
        buildMockCommerceRegularFacetValue({value: 'TED', state});
      it('dispatches #toggleSelectActionCreator with the passed facet value', () => {
        facet.toggleSingleSelect(facetValue());

        expect(engine.actions).toContainEqual(
          toggleSelectActionCreator({facetId, selection: facetValue()})
        );
      });

      it('dispatches #fetchResultsActionCreator', () => {
        facet.toggleSingleSelect(facetValue());

        const action = engine.findAsyncAction(
          fetchResultsActionCreator.pending
        );
        expect(action).toBeTruthy();
      });

      it('does not dispatch the #deselectAllFacetValues action', () => {
        facet.toggleSingleSelect(facetValue());

        expect(engine.actions).not.toContainEqual(
          deselectAllFacetValues(facetId)
        );
      });
    });
  });

  describe('#toggleSingleExclude', () => {
    describe('when toggled facet value state is "idle"', () => {
      const facetValue = () =>
        buildMockCommerceRegularFacetValue({value: 'TED', state: 'idle'});
      it('dispatches #toggleExcludeActionCreator with the passed facet value', () => {
        facet.toggleSingleExclude(facetValue());

        expect(engine.actions).toContainEqual(
          toggleExcludeActionCreator({facetId, selection: facetValue()})
        );
      });

      it('dispatches #fetchResultsActionCreator', () => {
        facet.toggleSingleExclude(facetValue());

        const action = engine.findAsyncAction(
          fetchResultsActionCreator.pending
        );
        expect(action).toBeTruthy();
      });

      it('dispatches the #deselectAllFacetValues action with the facetId', () => {
        facet.toggleSingleExclude(facetValue());

        expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
      });
    });

    describe.each([
      {
        state: 'excluded' as FacetValueState,
      },
      {
        state: 'selected' as FacetValueState,
      },
    ])('when toggled facet value state is "$state"', ({state}) => {
      const facetValue = () =>
        buildMockCommerceRegularFacetValue({value: 'TED', state});
      it('dispatches #toggleExcludeActionCreator with the passed facet value', () => {
        facet.toggleSingleExclude(facetValue());

        expect(engine.actions).toContainEqual(
          toggleExcludeActionCreator({facetId, selection: facetValue()})
        );
      });

      it('dispatches #fetchResultsActionCreator', () => {
        facet.toggleSingleExclude(facetValue());

        const action = engine.findAsyncAction(
          fetchResultsActionCreator.pending
        );
        expect(action).toBeTruthy();
      });

      it('does not dispatch the #deselectAllFacetValues action', () => {
        facet.toggleSingleExclude(facetValue());

        expect(engine.actions).not.toContainEqual(
          deselectAllFacetValues(facetId)
        );
      });
    });
  });

  describe('#isValueSelected', () => {
    it.each([
      {state: 'selected', expected: true},
      {state: 'excluded', expected: false},
      {state: 'idle', expected: false},
    ])(
      'when the passed value is "$state", returns $expected',
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
      'when the passed value is "$state", returns $expected',
      ({state, expected}) => {
        const facetValue = buildMockCommerceRegularFacetValue({
          state: state as FacetValueState,
        });
        expect(facet.isValueExcluded(facetValue)).toBe(expected);
      }
    );
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllFacetValues with the facet id', () => {
      facet.deselectAll();
      expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
    });
  });

  describe('#showMoreValues', () => {
    it('increases the number of values on the request by the configured amount', () => {
      const numberOfValues = 10;

      setFacetRequest({numberOfValues, initialNumberOfValues: 10});
      setFacetResponse({
        values: [buildMockCommerceRegularFacetValue({state: 'idle'})],
      });
      initFacet();

      facet.showMoreValues();

      const action = updateFacetNumberOfValues({
        facetId,
        numberOfValues: 20,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('updates isFieldExpanded to true', () => {
      facet.showMoreValues();

      const action = updateFacetIsFieldExpanded({
        facetId,
        isFieldExpanded: true,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #fetchResultsActionCreator', () => {
      facet.showMoreValues();

      const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
      expect(action).toBeTruthy();
    });
  });

  describe('#showLessValues', () => {
    it('sets the number of values to the original number', () => {
      const initialNumberOfValues = 10;
      setFacetRequest({numberOfValues: 25, initialNumberOfValues: 10});
      setFacetResponse({
        values: Array(initialNumberOfValues).fill(
          buildMockCommerceRegularFacetValue({value: 'Value'})
        ),
      });
      initFacet();

      facet.showLessValues();

      const action = updateFacetNumberOfValues({
        facetId,
        numberOfValues: initialNumberOfValues,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('when number of non-idle values > original number, sets number of values to non-idle number', () => {
      const selectedValue = buildMockCommerceRegularFacetValue({
        state: 'selected',
      });
      const values = [selectedValue, selectedValue];

      setFacetRequest({values, numberOfValues: 2});
      setFacetResponse({
        values: [buildMockCommerceRegularFacetValue({value: 'Some Value'})],
      });
      initFacet();

      facet.showLessValues();

      const action = updateFacetNumberOfValues({
        facetId,
        numberOfValues: 2,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('updates isFieldExpanded to "false"', () => {
      facet.showLessValues();

      const action = updateFacetIsFieldExpanded({
        facetId,
        isFieldExpanded: false,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #fetchResultsActionCreator', () => {
      facet.showLessValues();

      const action = engine.findAsyncAction(fetchResultsActionCreator.pending);
      expect(action).toBeTruthy();
    });
  });

  describe('#state', () => {
    it('#state.facetId exposes the facetId', () => {
      expect(facet.state.facetId).toBe(facetId);
    });

    it('#state.type exposes the type', () => {
      expect(facet.state.type).toBe(type);
    });

    it('#state.field exposes the field', () => {
      expect(facet.state.field).toBe(field);
    });

    it('#state.displayName exposes the displayName', () => {
      expect(facet.state.displayName).toBe(displayName);
    });

    it('#state.values contains the same values as from the response', () => {
      const values = [buildMockCommerceRegularFacetValue()];
      const facetResponse = buildMockCommerceRegularFacetResponse({
        facetId,
        values,
      });

      state.productListing.facets = [facetResponse];
      expect(facet.state.values).toBe(values);
    });

    describe('#state.hasActiveValues', () => {
      it('when #state.values has a value with a non-idle state, returns "true"', () => {
        const facetResponse = buildMockCommerceRegularFacetResponse({facetId});
        facetResponse.values = [
          buildMockCommerceRegularFacetValue({state: 'selected'}),
        ];
        state.productListing.facets = [facetResponse];

        expect(facet.state.hasActiveValues).toBe(true);
      });

      it('when #state.values only has idle values, returns "false"', () => {
        const facetResponse = buildMockCommerceRegularFacetResponse({facetId});
        facetResponse.values = [
          buildMockCommerceRegularFacetValue({state: 'idle'}),
        ];
        state.productListing.facets = [facetResponse];

        expect(facet.state.hasActiveValues).toBe(false);
      });
    });

    describe('#state.canShowMoreValues', () => {
      it('when there is no response, returns "false"', () => {
        expect(facet.state.canShowMoreValues).toBe(false);
      });

      it('when #moreValuesAvailable in the response is "true", returns "true"', () => {
        const facetResponse = buildMockCommerceRegularFacetResponse({
          facetId,
          moreValuesAvailable: true,
        });

        state.productListing.facets = [facetResponse];
        expect(facet.state.canShowMoreValues).toBe(true);
      });

      it('when #moreValuesAvailable in the response is "false", returns "false"', () => {
        const facetResponse = buildMockCommerceRegularFacetResponse({
          facetId,
          moreValuesAvailable: false,
        });

        state.productListing.facets = [facetResponse];
        expect(facet.state.canShowMoreValues).toBe(false);
      });
    });

    describe('#state.canShowLessValues', () => {
      it('when the number of currentValues is equal to the configured number, it returns false', () => {
        const values = [buildMockCommerceRegularFacetValue()];
        setFacetRequest({values, initialNumberOfValues: 1, numberOfValues: 1});
        setFacetResponse({
          values: [buildMockCommerceRegularFacetValue({value: 'Some Value'})],
        });

        initFacet();

        expect(facet.state.canShowLessValues).toBe(false);
      });

      it('when the number of currentValues is greater than the configured number, it returns true', () => {
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
  });
});
