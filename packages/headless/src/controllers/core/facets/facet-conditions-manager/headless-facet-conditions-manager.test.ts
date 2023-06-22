import {AnyAction} from '@reduxjs/toolkit';
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
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildFacetOptionsSlice} from '../../../../test/mock-facet-options-slice';
import {buildMockFacetRequest} from '../../../../test/mock-facet-request';
import {buildMockFacetSlice} from '../../../../test/mock-facet-slice';
import {buildMockFacetValueRequest} from '../../../../test/mock-facet-value-request';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {FacetValueState} from '../facet/headless-core-facet';
import {
  buildCoreFacetConditionsManager,
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
      state.facetSet[facetId] = buildMockFacetSlice();
      state.facetOptions.facets[facetId] = buildFacetOptionsSlice();
      facetConditionsManager = buildCoreFacetConditionsManager(engine, {
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
        state.facetSet[parentFacetId] = buildMockFacetSlice();
        state.facetOptions.facets[parentFacetId] = buildFacetOptionsSlice();
        initCondition();
        state.facetSet[parentFacetId]!.request.currentValues = [
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
          state.facetSet[parentFacetId]!.request.currentValues
        );
      });
    });

    describe('with a parent category facet', () => {
      beforeEach(() => {
        state.categoryFacetSet[parentFacetId] = buildMockCategoryFacetSlice();
        state.facetOptions.facets[parentFacetId] = buildFacetOptionsSlice();
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
        state.numericFacetSet[parentFacetId] = buildMockNumericFacetSlice();
        state.facetOptions.facets[parentFacetId] = buildFacetOptionsSlice();
        initCondition();
        state.numericFacetSet[parentFacetId]!.request.currentValues = [
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
          state.numericFacetSet[parentFacetId]!.request.currentValues
        );
      });
    });

    describe('with a parent date facet', () => {
      beforeEach(() => {
        state.dateFacetSet[parentFacetId] = buildMockDateFacetSlice();
        state.facetOptions.facets[parentFacetId] = buildFacetOptionsSlice();
        initCondition();
        state.dateFacetSet[parentFacetId]!.request.currentValues = [
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
          state.dateFacetSet[parentFacetId]!.request.currentValues
        );
      });
    });
  });

  describe('with two conditions', () => {
    const dependentFacetId = 'abc';
    const parentFacetAId = 'def';
    const parentFacetBId = 'ghi';
    function updateFacetValues(facetId: string, conditionMet: boolean) {
      const values = state.facetSet[facetId]!.request.currentValues;
      const valueState: FacetValueState = conditionMet ? 'selected' : 'idle';
      if (values.length) {
        values[0].value += 'a';
        values[0].state = valueState;
      } else {
        values.push({value: 'a', state: valueState});
      }
    }

    function getConditionIsMet(facetId: string) {
      return (
        state.facetSet?.[facetId]!.request.currentValues?.[0]?.state ===
        'selected'
      );
    }

    function initFacet({
      facetId,
      enabled,
      conditionMet,
    }: {
      facetId: string;
      enabled: boolean;
      conditionMet?: boolean;
    }) {
      state.facetOptions.facets[facetId] = buildFacetOptionsSlice({enabled});
      state.facetSet[facetId] = buildMockFacetSlice({
        request: buildMockFacetRequest({facetId}),
      });
      if (conditionMet) {
        updateFacetValues(facetId, true);
      }
    }

    function initConditions() {
      buildCoreFacetConditionsManager(engine, {
        facetId: dependentFacetId,
        conditions: [
          {
            parentFacetId: parentFacetAId,
            condition: jest.fn(() => getConditionIsMet(parentFacetAId)),
          },
          {
            parentFacetId: parentFacetBId,
            condition: jest.fn(() => getConditionIsMet(parentFacetBId)),
          },
        ],
      });
    }

    describe('when facets are initialized before the conditions manager', () => {
      it('when all facets are enabled and no condition is met, disables the facet', () => {
        initFacet({facetId: dependentFacetId, enabled: true});
        initFacet({
          facetId: parentFacetAId,
          enabled: true,
          conditionMet: false,
        });
        initFacet({
          facetId: parentFacetBId,
          enabled: true,
          conditionMet: false,
        });
        initConditions();
        expect(engine.actions).toContainEqual(disableFacet(dependentFacetId));
      });

      it('when all facets are enabled and one condition is met, does not dispatch any action', () => {
        initFacet({facetId: dependentFacetId, enabled: true});
        initFacet({facetId: parentFacetAId, enabled: true, conditionMet: true});
        initFacet({
          facetId: parentFacetBId,
          enabled: true,
          conditionMet: false,
        });
        initConditions();
        expect(engine.actions).toEqual([]);
      });

      it('when only the child facet is disabled and no condition is met, does not dispatch any action', () => {
        initFacet({facetId: dependentFacetId, enabled: false});
        initFacet({
          facetId: parentFacetAId,
          enabled: true,
          conditionMet: false,
        });
        initFacet({
          facetId: parentFacetBId,
          enabled: true,
          conditionMet: false,
        });
        initConditions();
        expect(engine.actions).toEqual([]);
      });

      it('when only the child facet is disabled and one condition is met, enables the facet', () => {
        initFacet({facetId: dependentFacetId, enabled: false});
        initFacet({facetId: parentFacetAId, enabled: true, conditionMet: true});
        initFacet({
          facetId: parentFacetBId,
          enabled: true,
          conditionMet: false,
        });
        initConditions();
        expect(engine.actions).toContainEqual(enableFacet(dependentFacetId));
      });

      it('when only facet B is enabled and condition A is met, does not dispatch any action', () => {
        initFacet({facetId: dependentFacetId, enabled: false});
        initFacet({
          facetId: parentFacetAId,
          enabled: false,
          conditionMet: true,
        });
        initFacet({
          facetId: parentFacetBId,
          enabled: true,
          conditionMet: false,
        });
        initConditions();
        expect(engine.actions).toEqual([]);
      });

      it('when only facet A is enabled and condition A is met, enables the facet', () => {
        initFacet({facetId: dependentFacetId, enabled: false});
        initFacet({facetId: parentFacetAId, enabled: true, conditionMet: true});
        initFacet({
          facetId: parentFacetBId,
          enabled: false,
          conditionMet: false,
        });
        initConditions();
        expect(engine.actions).toContainEqual(enableFacet(dependentFacetId));
      });

      it('when only facet A is disabled and condition A is met, disables the facet', () => {
        initFacet({facetId: dependentFacetId, enabled: true});
        initFacet({
          facetId: parentFacetAId,
          enabled: false,
          conditionMet: true,
        });
        initFacet({
          facetId: parentFacetBId,
          enabled: true,
          conditionMet: false,
        });
        initConditions();
        expect(engine.actions).toContainEqual(disableFacet(dependentFacetId));
      });

      it('when only facet B is disabled and condition A is met, does not dispatch any action', () => {
        initFacet({facetId: dependentFacetId, enabled: true});
        initFacet({facetId: parentFacetAId, enabled: true, conditionMet: true});
        initFacet({
          facetId: parentFacetBId,
          enabled: false,
          conditionMet: false,
        });
        initConditions();
        expect(engine.actions).toEqual([]);
      });
    });

    describe('when facets are initialized after the conditions manager', () => {
      beforeEach(() => {
        initConditions();
        engineListener();
      });

      it('does not dispatch any action', () => {
        expect(engine.actions).toEqual([]);
      });

      describe('when the dependent facet is initialized and enabled', () => {
        beforeEach(() => {
          initFacet({facetId: dependentFacetId, enabled: true});
        });

        describe('and no parent is initialized', () => {
          beforeEach(() => {
            engineListener();
          });

          it('disables the facet', () => {
            expect(engine.actions).toContainEqual(
              disableFacet(dependentFacetId)
            );
          });
        });

        describe("and a parent is initialized but its condition isn't met", () => {
          beforeEach(() => {
            initFacet({
              facetId: parentFacetAId,
              enabled: true,
              conditionMet: false,
            });
            engineListener();
          });

          it('disables the facet', () => {
            expect(engine.actions).toContainEqual(
              disableFacet(dependentFacetId)
            );
          });
        });
      });

      describe('when the dependent facet is initialized and disabled', () => {
        beforeEach(() => {
          initFacet({facetId: dependentFacetId, enabled: false});
        });

        describe('and a parent is initialized and its condition is met', () => {
          beforeEach(() => {
            initFacet({
              facetId: parentFacetAId,
              enabled: true,
              conditionMet: true,
            });
            engineListener();
          });

          it('enables the facet', () => {
            expect(engine.actions).toContainEqual(
              enableFacet(dependentFacetId)
            );
          });
        });

        describe("and a parent is initialized and it condition isn't met", () => {
          beforeEach(() => {
            initFacet({
              facetId: parentFacetAId,
              enabled: true,
              conditionMet: false,
            });
            engineListener();
          });

          it('does not dispatch any action', () => {
            expect(engine.actions).toEqual([]);
          });

          describe('then facet values are updated and the condition becomes met', () => {
            beforeEach(() => {
              updateFacetValues(parentFacetAId, true);
              engineListener();
            });

            it('enables the facet', () => {
              expect(engine.actions).toContainEqual(
                enableFacet(dependentFacetId)
              );
            });
          });
        });
      });
    });
  });
});
