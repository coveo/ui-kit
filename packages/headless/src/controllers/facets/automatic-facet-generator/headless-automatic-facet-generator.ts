import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {setOptions} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
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
import {
  AutomaticFacetGeneratorOptions,
  buildOptions,
} from './headless-automatic-facet-generator-options';

export type {AutomaticFacetGeneratorOptions};
/**
 * The `AutomaticFacetGenerator` headless controller offers a high-level interface for rendering automatic facets.
 */
export interface AutomaticFacetGenerator extends Controller {
  /**
   * The state of the `AutomaticFacetGenerator` controller.
   */
  state: AutomaticFacetGeneratorState;
}

export interface AutomaticFacetGeneratorState {
  /**
   * @beta - This property is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The list of automatic facet controllers.
   */
  automaticFacets: AutomaticFacet[];
}

export interface AutomaticFacetGeneratorProps {
  /**
   * The options for the `AutomaticFacetGenerator` controller.
   * */
  options: AutomaticFacetGeneratorOptions;
}

/**
 * @beta - This function is part of the automatic facets feature.
 * Automatic facets are currently in beta testing and should be available soon.
 *
 * Creates a `AutomaticFacetGenerator` instance.
 *
 * @param engine - The headless engine.
 * @param props - The automatic facets props. Automatic facets are currently in beta testing and should be available soon.
 * @returns A `AutomaticFacetGenerator` controller instance.
 */
export function buildAutomaticFacetGenerator(
  engine: SearchEngine,
  props: AutomaticFacetGeneratorProps
): AutomaticFacetGenerator {
  if (!loadAutomaticFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  console.log(props.options);
  const options = buildOptions(props.options);
  console.log(options);
  dispatch(setOptions(options));

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

function loadAutomaticFacetGeneratorReducers(
  engine: CoreEngine
): engine is CoreEngine<
  AutomaticFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({automaticFacetSet, configuration, search});
  return true;
}
