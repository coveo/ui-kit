import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {setDesiredCount} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {automaticFacetSetReducer as automaticFacetSet} from '../../../features/facets/automatic-facet-set/automatic-facet-set-slice';
import {searchReducer as search} from '../../../features/search/search-slice';
import {
  AutomaticFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  Controller,
  buildController,
} from '../../controller/headless-controller';
import {
  AutomaticFacet,
  buildAutomaticFacet,
} from '../automatic-facet/headless-automatic-facet';

/**
 * The `AutomaticFacetBuilder` headless controller offers a high-level interface for rendering automatic facets.
 */
export interface AutomaticFacetBuilder extends Controller {
  /**
   * The state of the `AutomaticFacetBuilder` controller.
   */
  state: AutomaticFacetBuilderState;
}

export interface AutomaticFacetBuilderState {
  /**
   * @beta - This property is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The list of automatic facet controllers.
   */
  automaticFacets: AutomaticFacet[];
}

export interface AutomaticFacetBuilderProps {
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
 * Creates a `AutomaticFacetBuilder` instance.
 *
 * @param engine - The headless engine.
 * @param props - The automatic facets props. Automatic facets are currently in beta testing and should be available soon.
 * @returns A `AutomaticFacetBuilder` controller instance.
 */
export function buildAutomaticFacetBuilder(
  engine: SearchEngine,
  props: AutomaticFacetBuilderProps
): AutomaticFacetBuilder {
  if (!loadAutomaticFacetBuilderReducers(engine)) {
    throw loadReducerError;
  }
  const {dispatch} = engine;
  dispatch(setDesiredCount(props.desiredCount));

  const controller = buildController(engine);

  return {
    ...controller,

    get state() {
      const automaticFacets =
        engine.state.search.response.generateAutomaticFacets?.facets.map(
          (facet) => buildAutomaticFacet(engine, {field: facet.field})
        ) ?? [];
      return {
        automaticFacets,
      };
    },
  };
}

function loadAutomaticFacetBuilderReducers(
  engine: CoreEngine
): engine is CoreEngine<
  AutomaticFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({automaticFacetSet, configuration, search});
  return true;
}
