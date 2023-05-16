import {CoreEngine} from '../../../../app/engine';
import {
  disableFacet,
  enableFacet,
} from '../../../../features/facet-options/facet-options-actions';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice';
import {updateFreezeCurrentValues} from '../../../../features/facets/facet-set/facet-set-actions';
import {AnyFacetValueRequest} from '../../../../features/facets/generic/interfaces/generic-facet-request';
import {AnyFacetValue} from '../../../../features/facets/generic/interfaces/generic-facet-response';
import {
  CategoryFacetSection,
  DateFacetSection,
  FacetOptionsSection,
  FacetSection,
  NumericFacetSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {getObjectHash} from '../../../../utils/utils';

export interface AnyFacetValuesCondition<T extends AnyFacetValueRequest> {
  /**
   * The `facetId` of the facet whose values are used as input by the condition.
   */
  parentFacetId: string;
  /**
   * A callback function that must evaluate to `true` for the condition to be met.
   * @example
   * ```ts
   * const fileTypeHasSomeSelectedValue: AnyFacetValueCondition<FacetValueRequest> = {
   *   parentFacetId: 'filetype',
   *   condition: (parentValues) => parentValues.some(value => value.state === 'selected')
   * }
   * ```
   * .
   * @param parentValues - The current values of the facet whose `facetId` is the `parentFacetId` value.
   * @returns Whether the condition is met.
   */
  condition(parentValues: T[]): boolean;
}

export interface FacetConditionsManagerProps {
  /**
   * The `facetId` of the facet to enable or disable depending on whether conditions are met.
   */
  facetId: string;
  /**
   * The conditions to evaluate.
   *
   * * If any of these conditions is met, the dependent facet is enabled.
   * * If none of these conditions is met, the dependent facet is disabled.
   */
  conditions: AnyFacetValuesCondition<AnyFacetValueRequest>[];
}

export interface FacetConditionsManager {
  /**
   * Unsubscribes the target facet from this managers' conditions.
   */
  stopWatching(): void;
}

/**
 * A manager that enables or disables a facet based on whether target conditions are met.
 * @param engine - The headless engine.
 * @param props - The configurable `FacetConditionsManager` properties.
 * @returns A new facet conditions manager.
 */
export function buildCoreFacetConditionsManager(
  engine: CoreEngine,
  props: FacetConditionsManagerProps
): FacetConditionsManager {
  if (!loadFacetConditionsManagerReducers(engine)) {
    throw loadReducerError;
  }

  const isFacetEnabled = (facetId: string) => {
    return engine.state.facetOptions.facets[facetId]?.enabled ?? false;
  };

  const getFacetValuesById = (facetId: string) =>
    engine.state.facetSet?.[facetId]?.request?.currentValues ??
    engine.state.categoryFacetSet?.[facetId]?.request?.currentValues ??
    engine.state.numericFacetSet?.[facetId]?.request?.currentValues ??
    engine.state.dateFacetSet?.[facetId]?.request?.currentValues ??
    null;

  const isFacetRegistered = (facetId: string) =>
    facetId in engine.state.facetOptions.facets;

  const getRelevantStateHash = () =>
    getObjectHash({
      isFacetRegistered: isFacetRegistered(props.facetId),
      parentFacets: props.conditions.map(({parentFacetId}) =>
        isFacetRegistered(parentFacetId)
          ? {
              enabled: isFacetEnabled(parentFacetId),
              values: getFacetValuesById(parentFacetId),
            }
          : null
      ),
    });

  const relevantStateHasChanged = () => {
    const newStateHash = getRelevantStateHash();
    if (newStateHash === relevantStateHash) {
      return false;
    }
    relevantStateHash = newStateHash;
    return true;
  };

  const areConditionsMet = () => {
    return props.conditions.some((condition) => {
      if (!isFacetEnabled(condition.parentFacetId)) {
        return false;
      }
      const values = getFacetValuesById(condition.parentFacetId);
      if (values === null) {
        return false;
      }
      return condition.condition(values as AnyFacetValue[]);
    });
  };

  const unfreezeFacetValues = () => {
    if (engine.state.facetSet) {
      Object.entries(engine.state.facetSet).forEach(
        ([facetId, slice]) =>
          slice.request.freezeCurrentValues &&
          engine.dispatch(
            updateFreezeCurrentValues({facetId, freezeCurrentValues: false})
          )
      );
    }
  };

  const ensureConditions = () => {
    if (!isFacetRegistered(props.facetId)) {
      return;
    }
    const isEnabled = isFacetEnabled(props.facetId);
    const shouldBeEnabled = areConditionsMet();
    if (isEnabled !== shouldBeEnabled) {
      engine.dispatch(
        shouldBeEnabled
          ? enableFacet(props.facetId)
          : disableFacet(props.facetId)
      );
      unfreezeFacetValues();
    }
  };

  if (!props.conditions.length) {
    return {stopWatching() {}};
  }

  let relevantStateHash = getRelevantStateHash();
  const unsubscribe = engine.subscribe(() => {
    if (relevantStateHasChanged()) {
      ensureConditions();
    }
  });

  ensureConditions();

  return {
    stopWatching() {
      unsubscribe();
    },
  };
}

function loadFacetConditionsManagerReducers(
  engine: CoreEngine
): engine is CoreEngine<
  FacetOptionsSection &
    Partial<FacetSection> &
    Partial<CategoryFacetSection> &
    Partial<NumericFacetSection> &
    Partial<DateFacetSection>
> {
  engine.addReducers({facetOptions});
  return true;
}
