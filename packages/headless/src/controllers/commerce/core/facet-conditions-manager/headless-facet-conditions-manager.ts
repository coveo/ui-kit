import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {
  disableFacet,
  enableFacet,
} from '../../../../features/facet-options/facet-options-actions';
import {facetOptionsReducer as facetOptions} from '../../../../features/facet-options/facet-options-slice';
import {updateFreezeCurrentValues} from '../../../../features/facets/facet-set/facet-set-actions';
import {AnyFacetValue} from '../../../../features/facets/generic/interfaces/generic-facet-response';
import {
  CommerceFacetSetSection,
  FacetOptionsSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {getObjectHash} from '../../../../utils/utils';
import {
  FacetConditionsManager,
  FacetConditionsManagerProps,
} from '../../../core/facets/facet-conditions-manager/headless-facet-conditions-manager';

export type {FacetConditionsManager, FacetConditionsManagerProps};

/**
 * A manager that enables or disables a facet based on whether target conditions are met.
 * @param engine - The headless engine.
 * @param props - The configurable `FacetConditionsManager` properties.
 * @returns A new facet conditions manager.
 *
 * @internal
 */
export function buildCoreFacetConditionsManager(
  engine: CommerceEngine,
  props: FacetConditionsManagerProps
): FacetConditionsManager {
  if (!loadFacetConditionsManagerReducers(engine)) {
    throw loadReducerError;
  }

  const getState = () => engine[stateKey];

  const isFacetEnabled = (facetId: string) => {
    return getState().facetOptions.facets[facetId]?.enabled ?? false;
  };

  const getFacetValuesById = (facetId: string) =>
    getState().facetSet?.[facetId]?.request?.currentValues ??
    getState().categoryFacetSet?.[facetId]?.request?.currentValues ??
    getState().numericFacetSet?.[facetId]?.request?.currentValues ??
    getState().dateFacetSet?.[facetId]?.request?.currentValues ??
    null;

  const isFacetRegistered = (facetId: string) =>
    facetId in getState().facetOptions.facets;

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
    const {facetSet} = getState();
    if (facetSet) {
      Object.entries(facetSet).forEach(
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
  engine: CommerceEngine
): engine is CommerceEngine<
  FacetOptionsSection & Partial<CommerceFacetSetSection>
> {
  engine.addReducers({facetOptions});
  return true;
}
