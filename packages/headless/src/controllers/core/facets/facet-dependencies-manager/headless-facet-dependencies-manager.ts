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

export interface AnyFacetDependency<T extends AnyFacetValueRequest> {
  parentFacetId: string;
  isDependencyMet: (parentValues: T[]) => boolean;
}

export interface FacetDependenciesManagerProps {
  dependentFacetId: string;
  dependencies: AnyFacetDependency<AnyFacetValueRequest>[];
}

export interface FacetDependenciesManager {
  stopWatching(): void;
}

export function buildFacetDependenciesManager(
  engine: CoreEngine,
  props: FacetDependenciesManagerProps
): FacetDependenciesManager {
  if (!loadFacetDependenciesManagerReducers(engine)) {
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

  const updateLastObservedValues = () => {
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

  const areDependenciesMet = () => {
    return props.dependencies.some((dependency) => {
      if (!isFacetEnabled(dependency.parentFacetId)) {
        return false;
      }
      const values = getFacetValuesById(dependency.parentFacetId);
      if (values === null) {
        return false;
      }
      return dependency.isDependencyMet(values as AnyFacetValue[]);
    });
  };

  const thawFacets = () => {
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

  const ensureDependenciesAreMet = () => {
    const isEnabled = isFacetEnabled(props.dependentFacetId);
    const shouldBeEnabled = areDependenciesMet();
    if (isEnabled !== shouldBeEnabled) {
      engine.dispatch(
        shouldBeEnabled
          ? enableFacet(props.dependentFacetId)
          : disableFacet(props.dependentFacetId)
      );
      thawFacets();
    }
  };

  props.dependencies.forEach((dependency) => {
    if (!(dependency.parentFacetId in lastObservedValuesPerParentFacet)) {
      lastObservedValuesPerParentFacet[dependency.parentFacetId] =
        JSON.stringify(getFacetValuesById(dependency.parentFacetId));
    }
  });

  const unsubscribe = props.dependencies.length
    ? engine.subscribe(() => {
        if (updateLastObservedValues()) {
          ensureDependenciesAreMet();
        }
      })
    : () => {};

  if (props.dependencies.length) {
    ensureDependenciesAreMet();
  }

  return {
    stopWatching() {
      unsubscribe();
    },
  };
}

function loadFacetDependenciesManagerReducers(
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
