import {configuration} from '../../app/common-reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {setDesiredCount} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {automaticFacetSetReducer as automaticFacetSet} from '../../features/facets/automatic-facet-set/automatic-facet-set-slice';
import {searchReducer as search} from '../../features/search/search-slice';
import {CoreEngine} from '../../product-listing.index';
import {
  AutomaticFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {
  buildCoreFacetManager,
  FacetManager as CoreFacetManager,
  FacetManagerState as CoreFacetManagerState,
  FacetManagerPayload,
} from '../core/facet-manager/headless-core-facet-manager';
import {
  AutomaticFacet,
  buildAutomaticFacet,
} from '../facets/automatic-facet/headless-automatic-facet';

export type {CoreFacetManagerState, FacetManagerPayload, CoreFacetManager};

export interface FacetManagerState extends CoreFacetManagerState {
  /**
   * @beta - This property is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The list of automatic facet controllers.
   */
  automaticFacets?: AutomaticFacet[];
}

export interface FacetManager extends CoreFacetManager {
  /**
   * The state of the `FacetManager` controller.
   */
  state: FacetManagerState;
}

export interface FacetManagerProps {
  /**
   * @beta - This property is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The desired count of automatic facets.
   * Must be a positive integer.
   */
  desiredCount: number;
}
/**
 * @beta - This function is part of the automatic facets feature.
 * Automatic facets are currently in beta testing and should be available soon.
 *
 * Creates a `FacetManager` instance.
 *
 * @param engine - The headless engine.
 * @param props - The optional facet manager props for the automatic facets feature. Automatic facets are currently in beta testing and should be available soon.
 * @returns A `FacetManager` controller instance.
 */
export function buildFacetManager(
  engine: SearchEngine,
  props?: FacetManagerProps
): FacetManager {
  if (!props?.desiredCount) {
    return buildCoreFacetManager(engine);
  }
  if (!loadFacetManagerReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  dispatch(setDesiredCount(props.desiredCount));

  const core = buildCoreFacetManager(engine);
  const getAutomaticFacets = () =>
    engine.state.search.response.generateAutomaticFacets?.facets;

  return {
    ...core,
    get state() {
      const automaticFacets = getAutomaticFacets()?.map((facet) =>
        buildAutomaticFacet(engine, {field: facet.field})
      );

      return {
        ...core.state,
        automaticFacets,
      };
    },
  };
}

function loadFacetManagerReducers(
  engine: CoreEngine
): engine is CoreEngine<
  AutomaticFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({automaticFacetSet, configuration, search});
  return true;
}
