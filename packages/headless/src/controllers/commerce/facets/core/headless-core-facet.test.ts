import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {FacetResponse} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildCoreFacet,
  Facet,
  FacetOptions,
  FacetValueState,
} from './headless-core-facet';

describe('facet', () => {
  const facetId = 'facet_id';
  const field = 'some_field';
  let options: FacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: Facet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildCoreFacet(engine, {options});
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, field, ...config}),
    });
  }

  function setFacetResponse(config: Partial<FacetResponse> = {}) {
    state.productListing.facets = [
      buildMockCommerceFacetResponse({facetId, field, ...config}),
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
    };

    state = buildMockCommerceState();
    setFacetRequest();
    setFacetResponse();

    initFacet();
  });

  it('renders', () => {
    expect(facet).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceFacetSet,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(facet.subscribe).toBeTruthy();
  });

  it('#state.field exposes the field', () => {
    expect(facet.state.field).toBe(field);
  });

  it('#state.facetId exposes the facetId', () => {
    expect(facet.state.facetId).toBe(facetId);
  });

  it('when the product listing response has a facet, the facet #state.values contains the same values', () => {
    const values = [buildMockCommerceFacetValue()];
    const facetResponse = buildMockCommerceFacetResponse({
      facetId,
      values,
    });

    state.productListing.facets = [facetResponse];
    expect(facet.state.values).toBe(values);
  });

  it('#toggleSelect dispatches a #toggleSelect action with the passed facet value', () => {
    const facetValue = buildMockCommerceFacetValue({value: 'TED'});
    facet.toggleSelect(facetValue);

    expect(engine.actions).toContainEqual(
      toggleSelectFacetValue({facetId, selection: facetValue})
    );
  });

  it('#toggleExclude dispatches a #toggleExclude action with the passed facet value', () => {
    const facetValue = buildMockCommerceFacetValue({value: 'TED'});
    facet.toggleExclude(facetValue);

    expect(engine.actions).toContainEqual(
      toggleExcludeFacetValue({facetId, selection: facetValue})
    );
  });

  describe('#toggleSingleSelect when the value state is "idle"', () => {
    const facetValue = () =>
      buildMockCommerceFacetValue({value: 'TED', state: 'idle'});

    it('dispatches a #toggleSelect action with the passed facet value', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        toggleSelectFacetValue({facetId, selection: facetValue()})
      );
    });

    it('dispatches a #deselectAllFacetValues action', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
    });
  });

  describe('#toggleSingleSelect when the value state is not "idle"', () => {
    const facetValue = () =>
      buildMockCommerceFacetValue({value: 'TED', state: 'selected'});

    it('dispatches a #toggleSelect action with the passed facet value', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).toContainEqual(
        toggleSelectFacetValue({facetId, selection: facetValue()})
      );
    });

    it('does not dispatch a #deselectAllFacetValues action', () => {
      facet.toggleSingleSelect(facetValue());

      expect(engine.actions).not.toContainEqual(
        deselectAllFacetValues(facetId)
      );
    });
  });

  it.each([
    {state: 'selected', expected: true},
    {state: 'excluded', expected: false},
    {state: 'idle', expected: false},
  ])(
    '#isValueSelected returns $expected when the passed value is "$state"',
    ({state, expected}) => {
      const facetValue = buildMockCommerceFacetValue({
        state: state as FacetValueState,
      });
      expect(facet.isValueSelected(facetValue)).toBe(expected);
    }
  );

  describe('#deselectAll', () => {
    it('dispatches #deselectAllFacetValues with the facet id', () => {
      facet.deselectAll();
      expect(engine.actions).toContainEqual(deselectAllFacetValues(facetId));
    });
  });

  describe('#state.hasActiveValues', () => {
    it('when #state.values has a value with a non-idle state, it returns true', () => {
      const facetResponse = buildMockCommerceFacetResponse({facetId});
      facetResponse.values = [buildMockCommerceFacetValue({state: 'selected'})];
      state.productListing.facets = [facetResponse];

      expect(facet.state.hasActiveValues).toBe(true);
    });

    it('when #state.values only has idle values, it returns false', () => {
      const facetResponse = buildMockCommerceFacetResponse({facetId});
      facetResponse.values = [buildMockCommerceFacetValue({state: 'idle'})];
      state.productListing.facets = [facetResponse];

      expect(facet.state.hasActiveValues).toBe(false);
    });
  });

  describe('#showMoreValues', () => {
    it('increases the number of values on the request by the configured amount', () => {
      const numberOfValues = 10;

      setFacetRequest({numberOfValues, initialNumberOfValues: 10});
      setFacetResponse({
        values: [buildMockCommerceFacetValue({state: 'idle'})],
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
  });

  describe('#state.canShowMoreValues', () => {
    it('when there is no response, it returns false', () => {
      expect(facet.state.canShowMoreValues).toBe(false);
    });

    it('when #moreValuesAvailable on the response is true, it returns true', () => {
      const facetResponse = buildMockCommerceFacetResponse({
        facetId,
        moreValuesAvailable: true,
      });

      state.productListing.facets = [facetResponse];
      expect(facet.state.canShowMoreValues).toBe(true);
    });

    it('when #moreValuesAvailable on the response is false, it returns false', () => {
      const facetResponse = buildMockCommerceFacetResponse({
        facetId,
        moreValuesAvailable: false,
      });

      state.productListing.facets = [facetResponse];
      expect(facet.state.canShowMoreValues).toBe(false);
    });
  });

  describe('#showLessValues', () => {
    it('sets the number of values to the original number', () => {
      const initialNumberOfValues = 10;
      setFacetRequest({numberOfValues: 25, initialNumberOfValues: 10});
      setFacetResponse({
        values: Array(initialNumberOfValues).fill(
          buildMockCommerceFacetValue({value: 'Value'})
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

    it(`when the number of non-idle values is greater than the original number,
    it sets the number of values to the non-idle number`, () => {
      const selectedValue = buildMockCommerceFacetValue({state: 'selected'});
      const values = [selectedValue, selectedValue];

      setFacetRequest({values, numberOfValues: 2});
      setFacetResponse({
        values: [buildMockCommerceFacetValue({value: 'Some Value'})],
      });
      initFacet();

      facet.showLessValues();

      const action = updateFacetNumberOfValues({
        facetId,
        numberOfValues: 2,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('updates isFieldExpanded to false', () => {
      facet.showLessValues();

      const action = updateFacetIsFieldExpanded({
        facetId,
        isFieldExpanded: false,
      });

      expect(engine.actions).toContainEqual(action);
    });
  });

  describe('#state.canShowLessValues', () => {
    it('when the number of currentValues is equal to the configured number, it returns false', () => {
      const values = [buildMockCommerceFacetValue()];
      setFacetRequest({values, initialNumberOfValues: 1, numberOfValues: 1});
      setFacetResponse({
        values: [buildMockCommerceFacetValue({value: 'Some Value'})],
      });

      initFacet();

      expect(facet.state.canShowLessValues).toBe(false);
    });

    it('when the number of currentValues is greater than the configured number, it returns true', () => {
      const value = buildMockCommerceFacetValue();

      setFacetRequest({values: [value, value]});
      setFacetResponse({
        values: [buildMockCommerceFacetValue({value: 'Some Value'})],
      });
      initFacet();

      expect(facet.state.canShowLessValues).toBe(true);
    });

    it(`when the number of currentValues is greater than the configured number,
    when there are no idle values, it returns false`, () => {
      const selectedValue = buildMockCommerceFacetValue({state: 'selected'});

      setFacetRequest({values: [selectedValue, selectedValue]});
      setFacetResponse({
        values: [buildMockCommerceFacetValue({value: 'Some Value'})],
      });
      initFacet();

      expect(facet.state.canShowLessValues).toBe(false);
    });
  });
});
