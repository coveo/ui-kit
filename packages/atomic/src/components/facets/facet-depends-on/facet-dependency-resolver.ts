import {
  SearchEngine,
  loadFacetSetActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
} from '@coveo/headless';
import {ObservableMap} from '@stencil/store';
import {groupBy} from 'lodash';
import {AtomicStore, FacetDependency, getFacet} from '../../../utils/store';
import {buildFacetDependsOnAnyValueCondition} from './facet-dependency-conditions';
import {FacetRequestWithType, FacetWithType} from './facet-union-types';

export interface IncorrectFacetEnableState {
  facetWithType: FacetWithType;
  shouldBeEnabled: boolean;
}

const facetHasSelectedValue = buildFacetDependsOnAnyValueCondition();

function checkIfAnyDependencyMet(
  engine: SearchEngine,
  state: AtomicStore,
  dependencies: FacetDependency[]
) {
  return dependencies.some((dependency) => {
    const facetWithType = getFacet(engine, state, dependency.parentFacetId);
    if (!facetWithType) {
      return false;
    }
    return dependency.isDependencyMet({
      type: facetWithType.type,
      request: facetWithType.request,
    } as FacetRequestWithType);
  });
}

function thawAllFacets(engine: SearchEngine) {
  Object.keys(engine.state.facetSet ?? {}).forEach((facetId) =>
    engine.dispatch(
      loadFacetSetActions(engine).updateFreezeCurrentValues({
        facetId,
        freezeCurrentValues: false,
      })
    )
  );
}

export function getIncorrectFacetStates(
  engine: SearchEngine,
  state: AtomicStore
) {
  const dependenciesPerDependantFacet = Object.entries(
    groupBy(
      state.facetDependencies,
      (dependency) => dependency.dependantFacetId
    )
  );
  const incorrectFacetStates: IncorrectFacetEnableState[] = [];
  dependenciesPerDependantFacet.forEach(([dependantFacetId, dependencies]) => {
    const areDependenciesMet = checkIfAnyDependencyMet(
      engine,
      state,
      dependencies
    );
    const facetWithType = getFacet(engine, state, dependantFacetId);
    if (!facetWithType) {
      return;
    }
    const isFacetEnabled = facetWithType.facet.state.enabled;
    if (areDependenciesMet !== isFacetEnabled) {
      incorrectFacetStates.push({
        facetWithType: facetWithType,
        shouldBeEnabled: areDependenciesMet,
      });
    }
  });
  return incorrectFacetStates;
}

export function fixFacetDependencies(
  engine: SearchEngine,
  store: ObservableMap<AtomicStore>
) {
  const state = store.state;
  let facetStatesToUpdate = getIncorrectFacetStates(engine, state);
  let facetWasEnabled = false;
  let facetValuesWereCleared = false;
  while (facetStatesToUpdate.length) {
    facetStatesToUpdate.forEach(({facetWithType, shouldBeEnabled}) => {
      if (shouldBeEnabled) {
        facetWithType.facet.enable();
        facetWasEnabled = true;
      } else {
        facetWithType.facet.disable();
        facetValuesWereCleared ||= facetHasSelectedValue(facetWithType);
      }
      facetStatesToUpdate = getIncorrectFacetStates(engine, state);
    });
  }
  if (facetWasEnabled || facetValuesWereCleared) {
    thawAllFacets(engine);
    engine.dispatch(
      loadSearchActions(engine).executeSearch(
        loadSearchAnalyticsActions(engine).logClearBreadcrumbs()
      )
    );
  }
}
