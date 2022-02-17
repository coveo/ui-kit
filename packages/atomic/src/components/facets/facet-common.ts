import {
  CategoryFacetValue,
  DateFacetValue,
  FacetValue,
  loadFacetSetActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
  NumericFacetValue,
  SearchEngine,
  SearchStatus,
  SearchStatusState,
} from '@coveo/headless';
import {ObservableMap} from '@stencil/store';
import {i18n} from 'i18next';
import {groupBy} from 'lodash';
import {
  FacetRequestWithType,
  AtomicStore,
  DependsOnParam,
  DependencyCondition,
  getFacet,
  DependantFacet,
} from '../../utils/store';

export interface BaseFacet<Facet, FacetState> {
  facet?: Facet;
  facetState?: FacetState;
  searchStatus: SearchStatus;
  searchStatusState: SearchStatusState;
  error: Error;
  isCollapsed: Boolean;
  label: string;
  field: string;
}

export interface FacetValueProps {
  i18n: i18n;
  displayValue: string;
  numberOfResults: number;
  isSelected: boolean;
  onClick(): void;
  searchQuery?: string;
  class?: string;
  part?: string;
  buttonRef?: (element?: HTMLButtonElement) => void;
}

export interface IncorrectFacetEnableState {
  facetId: string;
  shouldBeEnabled: boolean;
}

export const facetHasSelectedValue: DependencyCondition = ({request}) => {
  return !!(
    request.currentValues as (
      | FacetValue
      | CategoryFacetValue
      | NumericFacetValue
      | DateFacetValue
    )[]
  ).find((value) => value.state === 'selected');
};

export function buildFacetDependsOnValueCondition(
  expectedValues: string[]
): DependencyCondition {
  return (args) => {
    if (!facetHasSelectedValue(args)) {
      return false;
    }
    if (args.type === 'facets' || args.type === 'categoryFacets') {
      return args.request.currentValues.some(
        (value) =>
          value.state === 'selected' && expectedValues.includes(value.value)
      );
    }
    return true;
  };
}

export function parseDependsOn(
  dependsOn: Record<string, string[]>
): DependsOnParam[] {
  return Object.entries(dependsOn).map(([facetId, values]) => {
    if (values.length === 1 && values[0] === '') {
      return {
        parentFacetId: facetId,
        isDependencyMet: facetHasSelectedValue,
      };
    } else {
      return {
        parentFacetId: facetId,
        isDependencyMet: buildFacetDependsOnValueCondition(values),
      };
    }
  });
}

function checkIfAnyDependencyMet(
  engine: SearchEngine,
  state: AtomicStore,
  dependencies: DependantFacet[]
) {
  return dependencies.some((dependency) => {
    const {type, request} = getFacet(engine, state, dependency.parentFacetId)!;
    return dependency.isDependencyMet({
      type,
      request,
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

export function getIncorrectFacetEnableStates(
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
    const isFacetEnabled = getFacet(engine, state, dependantFacetId)!.facet
      .state.enabled;
    if (areDependenciesMet !== isFacetEnabled) {
      incorrectFacetStates.push({
        facetId: dependantFacetId,
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
  let facetStatesToUpdate = getIncorrectFacetEnableStates(engine, state);
  let facetWasEnabled = false;
  let facetValuesWereCleared = false;
  while (facetStatesToUpdate.length) {
    facetStatesToUpdate.forEach(({facetId, shouldBeEnabled}) => {
      const facet = getFacet(engine, state, facetId)!;
      if (shouldBeEnabled) {
        facet.facet.enable();
        facetWasEnabled = true;
      } else {
        facet.facet.disable();
        facetValuesWereCleared ||= facetHasSelectedValue(facet);
      }
      facetStatesToUpdate = getIncorrectFacetEnableStates(engine, state);
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
