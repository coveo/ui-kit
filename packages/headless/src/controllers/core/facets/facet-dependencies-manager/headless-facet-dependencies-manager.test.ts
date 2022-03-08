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
  buildFacetDependenciesManager,
  FacetDependenciesManager,
} from './headless-facet-dependencies-manager';

describe('facet dependencies manager', () => {
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

  describe('with a single dependency', () => {
    const dependentFacetId = 'abc';
    const parentFacetId = 'def';
    let facetDependenciesManager: FacetDependenciesManager;
    let isDependencyMet: jest.Mock;

    function initDependency() {
      facetDependenciesManager = buildFacetDependenciesManager(engine, {
        dependentFacetId,
        dependencies: [
          {
            parentFacetId,
            isDependencyMet: (isDependencyMet = jest.fn(() => false)),
          },
        ],
      });
    }

    it('subscribes', () => {
      initDependency();
      expect(engine.subscribe).toHaveBeenCalledTimes(1);
    });

    it('when stopWatching is called, unsubscribes', () => {
      initDependency();
      facetDependenciesManager.stopWatching();
      expect(engineUnsubscriber).toHaveBeenCalledTimes(1);
    });

    describe('with a parent facet', () => {
      beforeEach(() => {
        state.facetSet = {[parentFacetId]: buildMockFacetRequest()};
        state.facetOptions = buildMockFacetOptions({
          facets: {[parentFacetId]: buildFacetOptionsSlice()},
        });
        initDependency();
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

      it('calls isDependencyMet with the correct values', () => {
        expect(isDependencyMet).toHaveBeenCalledWith(
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
        initDependency();
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

      it('calls isDependencyMet with the correct values', () => {
        expect(isDependencyMet).toHaveBeenCalledWith(
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
        initDependency();
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

      it('calls isDependencyMet with the correct values', () => {
        expect(isDependencyMet).toHaveBeenCalledWith(
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
        initDependency();
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

      it('calls isDependencyMet with the correct values', () => {
        expect(isDependencyMet).toHaveBeenCalledWith(
          state.dateFacetSet[parentFacetId].currentValues
        );
      });
    });
  });

  describe('with two dependencies', () => {
    const dependentFacetId = 'abc';
    const parentFacetAId = 'def';
    const parentFacetBId = 'ghi';
    function initDependencies(
      dependentEnabled: boolean,
      facetA: {enabled: boolean; dependencyMet: boolean},
      facetB: {enabled: boolean; dependencyMet: boolean}
    ) {
      state.facetOptions = buildMockFacetOptions({
        facets: {
          [dependentFacetId]: buildFacetOptionsSlice({
            enabled: dependentEnabled,
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
      buildFacetDependenciesManager(engine, {
        dependentFacetId,
        dependencies: [
          {
            parentFacetId: parentFacetAId,
            isDependencyMet: jest.fn(() => facetA.dependencyMet),
          },
          {
            parentFacetId: parentFacetBId,
            isDependencyMet: jest.fn(() => facetB.dependencyMet),
          },
        ],
      });
    }

    it('when all facets are enabled and no dependency is met, disables the facet', () => {
      initDependencies(
        true,
        {enabled: true, dependencyMet: false},
        {enabled: true, dependencyMet: false}
      );
      expect(engine.actions).toContainEqual(disableFacet(dependentFacetId));
    });

    it('when all facets are enabled and one dependency is met, does not dispatch any action', () => {
      initDependencies(
        true,
        {enabled: true, dependencyMet: true},
        {enabled: true, dependencyMet: false}
      );
      expect(engine.actions).toEqual([]);
    });

    it('when only the dependent facet is disabled and no dependency is met, does not dispatch any action', () => {
      initDependencies(
        false,
        {enabled: true, dependencyMet: false},
        {enabled: true, dependencyMet: false}
      );
      expect(engine.actions).toEqual([]);
    });

    it('when only the dependent facet is disabled and one dependency is met, enables the facet', () => {
      initDependencies(
        false,
        {enabled: true, dependencyMet: true},
        {enabled: true, dependencyMet: false}
      );
      expect(engine.actions).toContainEqual(enableFacet(dependentFacetId));
    });

    it('when only facet B is enabled and dependency A is met, does not dispatch any action', () => {
      initDependencies(
        false,
        {enabled: false, dependencyMet: true},
        {enabled: true, dependencyMet: false}
      );
      expect(engine.actions).toEqual([]);
    });

    it('when only facet A is enabled and dependency A is met, enables the facet', () => {
      initDependencies(
        false,
        {enabled: true, dependencyMet: true},
        {enabled: false, dependencyMet: false}
      );
      expect(engine.actions).toContainEqual(enableFacet(dependentFacetId));
    });

    it('when only facet A is disabled and dependency A is met, disables the facet', () => {
      initDependencies(
        true,
        {enabled: false, dependencyMet: true},
        {enabled: true, dependencyMet: false}
      );
      expect(engine.actions).toContainEqual(disableFacet(dependentFacetId));
    });

    it('when only facet B is disabled and dependency A is met, does not dispatch any action', () => {
      initDependencies(
        true,
        {enabled: true, dependencyMet: true},
        {enabled: false, dependencyMet: false}
      );
      expect(engine.actions).toEqual([]);
    });
  });
});
