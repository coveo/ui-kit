// Toggle
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {toggleSelectAutomaticFacetValue} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {automaticFacetSelector} from '../../../features/facets/automatic-facet-set/automatic-facet-set-selectors';
import {AutomaticFacetResponse} from '../../../features/facets/automatic-facet-set/interfaces/response';
import {FacetValue} from '../../../features/facets/facet-set/interfaces/response';
import {
  Controller,
  buildController,
} from '../../controller/headless-controller';

export interface AutomaticFacetProps {
  field: string;
}
export interface AutomaticFacet extends Controller {
  /**
   * Toggles the specified facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: FacetValue): void;
  /**
   * Toggles the specified facet value, deselecting others.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSingleSelect(selection: FacetValue): void;
  /**
   * Deselects all facet values.
   * */
  deselectAll(): void;
  /**
   *  TODO
   */
  state: AutomaticFacetResponse;
}
export function buildAutomaticFacet(
  engine: SearchEngine,
  props: AutomaticFacetProps
): AutomaticFacet {
  const {dispatch} = engine;
  const controller = buildController(engine);

  const {field} = props;

  const getFacet = () =>
    automaticFacetSelector(engine.state.automaticFacetsSet, field);

  return {
    ...controller,

    toggleSelect(selection: FacetValue) {
      console.log(selection);
      dispatch(toggleSelectAutomaticFacetValue);
    },
    toggleSingleSelect(selection: FacetValue) {
      console.log(selection);
    },
    deselectAll() {},
    get state() {
      const facet = getFacet();
      if (!facet) {
        return {
          field: '',
          moreValuesAvailable: false,
          indexScore: 0,
          values: [],
        };
      }

      const {field, moreValuesAvailable, indexScore, values} = facet;

      return {field, moreValuesAvailable, indexScore, values};
    },
  };
}
