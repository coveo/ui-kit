import {AnyAction} from 'redux';
import {
  disableFacet,
  enableFacet,
} from '../../../../features/facet-options/facet-options-actions';
import {SearchAppState} from '../../../../state/search-app-state';
import {
  createMockState,
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../../test';
import {buildMockCategoryFacetSlice} from '../../../../test/mock-category-facet-slice';
import {buildMockCategoryFacetValueRequest} from '../../../../test/mock-category-facet-value-request';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildMockFacetOptions} from '../../../../test/mock-facet-options';
import {buildFacetOptionsSlice} from '../../../../test/mock-facet-options-slice';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetValueRequest} from '../../../../test/mock-facet-value-request';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {
  buildFacetConditionsManager,
  FacetConditionsManager,
} from './headless-facet-conditions-manager';

describe('facet conditions manager', () => {
  let state: SearchAppState;
  let engine: MockSearchEngine;
  let engineListener: Function;
  let engineUnsubscriber: jest.Mock;

  beforeEach(() => {
    state = createMockState();
    engine = buildMockSearchAppEngine({
      state,
      subscribe: jest.fn((listener) => {
        engineListener = listener;
        return (engineUnsubscriber = jest.fn());
      }),
      dispatch: jest.fn((action: AnyAction) =>
        engine.actions.push(action)
      ) as unknown as MockSearchEngine['dispatch'],
    });
  });

  describe('with a single condition', () => {
    const facetId = 'abc';
    const parentFacetId = 'def';
    let facetConditionsManager: FacetConditionsManager;
    let condition: jest.Mock;

    function initCondition() {
      facetConditionsManager = buildFacetConditionsManager(engine, {
        facetId: facetId,
        conditions: [
          {
            parentFacetId,
            condition: (condition = jest.fn(() => false)),
          },
        ],
      });
    }

    it('subscribes', () => {
      initCondition();
      expect(engine.subscribe).toHaveBeenCalledTimes(1);
    });

    it('when stopWatching is called, unsubscribes', () => {
      initCondition();
      facetConditionsManager.stopWatching();
      expect(engineUnsubscriber).toHaveBeenCalledTimes(1);
    });

    describe('with a parent facet', () => {
      beforeEach(() => {
        state.facetSet = {[parentFacetId]: buildMockFacetRequest()};
        state.facetOptions = buildMockFacetOptions({
          facets: {[parentFacetId]: buildFacetOptionsSlice()},
        });
        initCondition();
        state.facetSet[parentFacetId].currentValues = [
          buildMockFacetValueRequest({
            state: 'idle',
            value: 'value a',
          }),
          buildMockFacetValueRequest({
            state: 'selected',
            value: 'value b',
          }),
        ];
        engineListener();
      });

      it('calls condition with the correct values', () => {
        expect(condition).toHaveBeenCalledWith(
          state.facetSet[parentFacetId].currentValues
        );
      });
    });

    describe('with a parent category facet', () => {
      beforeEach(() => {
        state.categoryFacetSet = {
          [parentFacetId]: buildMockCategoryFacetSlice(),
        };
        state.facetOptions = buildMockFacetOptions({
          facets: {[parentFacetId]: buildFacetOptionsSlice()},
        });
        initCondition();
        state.categoryFacetSet[parentFacetId]!.request.currentValues = [
          buildMockCategoryFacetValueRequest({
            state: 'idle',
            value: 'value a',
          }),
          buildMockCategoryFacetValueRequest({
            state: 'selected',
            value: 'value b',
          }),
        ];
        engineListener();
      });

      it('calls condition with the correct values', () => {
        expect(condition).toHaveBeenCalledWith(
          state.categoryFacetSet[parentFacetId]!.request.currentValues
        );
      });
    });

    describe('with a parent numeric facet', () => {
      beforeEach(() => {
        state.numericFacetSet = {
          [parentFacetId]: buildMockNumericFacetRequest(),
        };
        state.facetOptions = buildMockFacetOptions({
          facets: {[parentFacetId]: buildFacetOptionsSlice()},
        });
        initCondition();
        state.numericFacetSet[parentFacetId].currentValues = [
          buildMockNumericFacetValue({
            state: 'idle',
            start: 0,
            end: 10,
          }),
          buildMockNumericFacetValue({
            state: 'selected',
            start: 10,
            end: 20,
          }),
        ];
        engineListener();
      });

      it('calls condition with the correct values', () => {
        expect(condition).toHaveBeenCalledWith(
          state.numericFacetSet[parentFacetId].currentValues
        );
      });
    });

    describe('with a parent date facet', () => {
      beforeEach(() => {
        state.dateFacetSet = {[parentFacetId]: buildMockDateFacetRequest()};
        state.facetOptions = buildMockFacetOptions({
          facets: {[parentFacetId]: buildFacetOptionsSlice()},
        });
        initCondition();
        state.dateFacetSet[parentFacetId].currentValues = [
          buildMockDateFacetValue({
            state: 'idle',
            start: '0',
            end: '10',
          }),
          buildMockDateFacetValue({
            state: 'selected',
            start: '10',
            end: '20',
          }),
        ];
        engineListener();
      });

      it('calls condition with the correct values', () => {
        expect(condition).toHaveBeenCalledWith(
          state.dateFacetSet[parentFacetId].currentValues
        );
      });
    });
  });

  describe('with two conditions', () => {
    const facetId = 'abc';
    const parentFacetAId = 'def';
    const parentFacetBId = 'ghi';
    function initConditions(
      facetEnabled: boolean,
      facetA: {enabled: boolean; conditionMet: boolean},
      facetB: {enabled: boolean; conditionMet: boolean}
    ) {
      state.facetOptions = buildMockFacetOptions({
        facets: {
          [facetId]: buildFacetOptionsSlice({
            enabled: facetEnabled,
          }),
          [parentFacetAId]: buildFacetOptionsSlice({enabled: facetA.enabled}),
          [parentFacetBId]: buildFacetOptionsSlice({enabled: facetB.enabled}),
        },
      });
      state.facetSet[parentFacetAId] = buildMockFacetRequest({
        facetId: parentFacetAId,
      });
      state.facetSet[parentFacetBId] = buildMockFacetRequest({
        facetId: parentFacetBId,
      });
      buildFacetConditionsManager(engine, {
        facetId: facetId,
        conditions: [
          {
            parentFacetId: parentFacetAId,
            condition: jest.fn(() => facetA.conditionMet),
          },
          {
            parentFacetId: parentFacetBId,
            condition: jest.fn(() => facetB.conditionMet),
          },
        ],
      });
    }

    it('when all facets are enabled and no condition is met, disables the facet', () => {
      initConditions(
        true,
        {enabled: true, conditionMet: false},
        {enabled: true, conditionMet: false}
      );
      expect(engine.actions).toContainEqual(disableFacet(facetId));
    });

    it('when all facets are enabled and one condition is met, does not dispatch any action', () => {
      initConditions(
        true,
        {enabled: true, conditionMet: true},
        {enabled: true, conditionMet: false}
      );
      expect(engine.actions).toEqual([]);
    });

    it('when only the child facet is disabled and no condition is met, does not dispatch any action', () => {
      initConditions(
        false,
        {enabled: true, conditionMet: false},
        {enabled: true, conditionMet: false}
      );
      expect(engine.actions).toEqual([]);
    });

    it('when only the child facet is disabled and one condition is met, enables the facet', () => {
      initConditions(
        false,
        {enabled: true, conditionMet: true},
        {enabled: true, conditionMet: false}
      );
      expect(engine.actions).toContainEqual(enableFacet(facetId));
    });

    it('when only facet B is enabled and condition A is met, does not dispatch any action', () => {
      initConditions(
        false,
        {enabled: false, conditionMet: true},
        {enabled: true, conditionMet: false}
      );
      expect(engine.actions).toEqual([]);
    });

    it('when only facet A is enabled and condition A is met, enables the facet', () => {
      initConditions(
        false,
        {enabled: true, conditionMet: true},
        {enabled: false, conditionMet: false}
      );
      expect(engine.actions).toContainEqual(enableFacet(facetId));
    });

    it('when only facet A is disabled and condition A is met, disables the facet', () => {
      initConditions(
        true,
        {enabled: false, conditionMet: true},
        {enabled: true, conditionMet: false}
      );
      expect(engine.actions).toContainEqual(disableFacet(facetId));
    });

    it('when only facet B is disabled and condition A is met, does not dispatch any action', () => {
      initConditions(
        true,
        {enabled: true, conditionMet: true},
        {enabled: false, conditionMet: false}
      );
      expect(engine.actions).toEqual([]);
    });
  });
});
