import {SearchEngine} from '../../../app/search-engine/search-engine';
import {setDesiredCount} from '../../../features/facets/automatic-facets/automatic-facets-actions';
import {loadAutomaticFacetsActions} from '../../../features/facets/automatic-facets/automatic-facets-actions-loader';
import {AutomaticFacetResponse} from '../../../features/facets/facet-set/interfaces/response';
import {loadReducerError} from '../../../utils/errors';
import {
  Controller,
  buildController,
} from '../../controller/headless-controller';
import {Facet, FacetProps, buildFacet} from '../facet/headless-facet';

/**
 * The AutomaticFacets controller.
 */
export interface AutomaticFacets extends Controller {
  /**
   * Builds the automatic facets.
   *
   * @returns An array of Facet controllers
   */
  buildFacets(): Facet[];
  /**
   * The state of the `AutomaticFacets` controller.
   */
  state: AutomaticFacetsState;
}

export interface AutomaticFacetsState {
  /**
   * TODO
   */
  facets: AutomaticFacetResponse[];
}

export interface AutomaticFacetsProps {
  /**
   * The desired count of automatic facets.
   *
   * The default value is 5.
   */
  desiredCount?: number;
}

export function buildAutomaticFacets(
  engine: SearchEngine,
  props: AutomaticFacetsProps
): AutomaticFacets {
  if (!loadAutomaticFacetsActions(engine)) {
    throw loadReducerError;
  }
  const {dispatch} = engine;
  const controller = buildController(engine);
  function buildFacets(): Facet[] {
    const facets: Facet[] = [];
    // const response = engine.state.search.response.generateAutomaticFacets;

    // if (response) {
    //   response.facets.forEach((facet) => {
    //     // TO CHANGE
    //     const props: FacetProps = {
    //       options: {
    //         field: facet.field,
    //         numberOfValues: facet.values.length,
    //       },
    //     };
    //     // MAYBE buildFacet IS NOT THE RIGHT FUNCTION TO USE I NEED TO  CREATE A SPECIAL CONTROLLER AND ADD ALL THE THINGS I GOT FROM THE RESPONSE TO IT ?????
    //     // Build my own buildFacetFunction to get a standard facet controller with all its info.
    //     facets.push(buildFacet(engine, props));
    //   });
    // }

    return facets;
  }
  if (props.desiredCount) {
    dispatch(setDesiredCount(props.desiredCount));
  }
  buildFacets();
  return {
    ...controller,
    buildFacets() {
      return buildFacets();
    },

    get state() {
      const automaticFacets =
        engine.state.search.response.generateAutomaticFacets;
      const facets = automaticFacets?.facets ?? [];
      return {facets};
    },
  };
}
