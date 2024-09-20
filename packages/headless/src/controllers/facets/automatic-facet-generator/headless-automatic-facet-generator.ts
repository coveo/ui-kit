import {configuration} from '../../../app/common-reducers.js';
import {CoreEngine} from '../../../app/engine.js';
import {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {setOptions} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions.js';
import {automaticFacetSetReducer as automaticFacetSet} from '../../../features/facets/automatic-facet-set/automatic-facet-set-slice.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import {
  AutomaticFacetSection,
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  Controller,
  buildController,
} from '../../controller/headless-controller.js';
import {buildAutomaticFacet} from '../automatic-facet/headless-automatic-facet.js';
import {FacetValue} from '../facet/headless-facet.js';
import {
  AutomaticFacetGeneratorOptions,
  buildOptions,
} from './headless-automatic-facet-generator-options.js';

export type {AutomaticFacetGeneratorOptions};

/**
 * The `AutomaticFacetGenerator` headless controller offers a high-level interface for rendering automatic facets.
 *
 * Unlike regular facets that need to be explicitly defined and requested in the query, automatic facets are dynamically
 * generated by the index in response to the query.
 *
 * To learn more about the automatic facet generator feature, see: [About the Facet Generator](https://docs.coveo.com/en/n9sd0159/).
 */
export interface AutomaticFacetGenerator extends Controller {
  /**
   * The state of the `AutomaticFacetGenerator` controller.
   */
  state: AutomaticFacetGeneratorState;
}

export interface AutomaticFacetGeneratorState {
  /**
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
 * A scoped and simplified part of the headless state that is relevant to the `Automatic Facet` controller.
 */
export interface AutomaticFacetState {
  /**
   * The automatic facet field.
   */
  field: string;
  /**
   * The automatic facet label.
   */
  label: string;
  /**
   * The automatic facet values.
   */
  values: FacetValue[];
}
/**
 * The `AutomaticFacet` controller allows you to create a search interface component that the end user
 * can interact with to refine a query by selecting filters based on item metadata (i.e., field values). Unlike regular facets that
 * need to be explicitly defined and requested in the query, automatic facets are dynamically generated by the index
 * in response to the query.
 *
 * To learn more about the automatic facet generator feature, see: [About the Facet Generator](https://docs.coveo.com/en/n9sd0159/).
 */
export interface AutomaticFacet extends Controller {
  /**
   * Toggles the specified automatic facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: FacetValue): void;
  /**
   * Deselects all automatic facet values.
   * */
  deselectAll(): void;
  /**
   *  The state of the `AutomaticFacet` controller.
   */
  state: AutomaticFacetState;
}

/**
 * Creates a `AutomaticFacetGenerator` instance.
 *
 * @param engine - The headless engine.
 * @param props - The automatic facets props.
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
  const options = buildOptions(props.options);
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
