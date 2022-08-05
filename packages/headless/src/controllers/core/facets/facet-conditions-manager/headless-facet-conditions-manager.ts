import {CoreEngine} from '../../../../app/engine';
import {facetOptions} from '../../../../app/reducers';
import {
  disableFacet,
  enableFacet,
} from '../../../../features/facet-options/facet-options-actions';
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
  const lastObservedValuesPerParentFacet: Record<string, string> = {};

  const isFacetEnabled = (facetId: string) => {
    return engine.state.facetOptions.facets[facetId]?.enabled ?? true;
  };

  const getFacetValuesById = (facetId: string) => {
    if (engine.state.facetSet && facetId in engine.state.facetSet) {
      return engine.state.facetSet[facetId].currentValues;
    }
    if (
      engine.state.categoryFacetSet &&
      facetId in engine.state.categoryFacetSet
    ) {
      return engine.state.categoryFacetSet[facetId]!.request.currentValues;
    }
    if (
      engine.state.numericFacetSet &&
      facetId in engine.state.numericFacetSet
    ) {
      return engine.state.numericFacetSet[facetId].currentValues;
    }
    if (engine.state.dateFacetSet && facetId in engine.state.dateFacetSet) {
      return engine.state.dateFacetSet[facetId].currentValues;
    }
    return null;
  };

  const checkIfParentValuesWereChanged = () => {
    let anyParentWasUpdated = false;
    Object.keys(lastObservedValuesPerParentFacet).forEach((parentFacetId) => {
      const stringifiedValues = JSON.stringify(
        getFacetValuesById(parentFacetId)
      );
      if (
        stringifiedValues === lastObservedValuesPerParentFacet[parentFacetId]
      ) {
        return;
      }
      lastObservedValuesPerParentFacet[parentFacetId] = stringifiedValues;
      anyParentWasUpdated = true;
    });
    return anyParentWasUpdated;
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
        ([facetId, request]) =>
          request.freezeCurrentValues &&
          engine.dispatch(
            updateFreezeCurrentValues({facetId, freezeCurrentValues: false})
          )
      );
    }
  };

  const ensureConditions = () => {
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

  props.conditions.forEach((condition) => {
    if (!(condition.parentFacetId in lastObservedValuesPerParentFacet)) {
      lastObservedValuesPerParentFacet[condition.parentFacetId] =
        JSON.stringify(getFacetValuesById(condition.parentFacetId));
    }
  });

  const unsubscribe = props.conditions.length
    ? engine.subscribe(() => {
        if (checkIfParentValuesWereChanged()) {
          ensureConditions();
        }
      })
    : () => {};

  if (props.conditions.length) {
    ensureConditions();
  }

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
