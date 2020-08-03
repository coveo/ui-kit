import {Engine} from '../../../app/headless-engine';
import {buildController} from '../../controller/headless-controller';
import {RangeFacetResponse} from '../../../features/facets/range-facets/generic/interfaces/range-facet';
import {
  FacetSelectionChangeMetadata,
  logFacetDeselect,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {facetSelector} from '../../../features/facets/facet-set/facet-set-selectors';

export type RangeFacet = ReturnType<typeof buildRangeFacet>;

export function buildRangeFacet<R extends RangeFacetResponse>(
  engine: Engine,
  facetId: string
) {
  type RangeFacetValue = R['values'][0];

  const controller = buildController(engine);
  const dispatch = engine.dispatch;
  const isValueSelected = (selection: RangeFacetValue) => {
    return selection.state === 'selected';
  };

  const getAnalyticsActionForToggleSelect = (selection: RangeFacetValue) => {
    const {start, end} = selection;
    const facetValue = `${start}..${end}`;
    const payload: FacetSelectionChangeMetadata = {facetId, facetValue};

    return isValueSelected(selection)
      ? logFacetDeselect(payload)
      : logFacetSelect(payload);
  };

  return {
    ...controller,
    /** Logs a deselect (select) value event when the passed value is active (idle), and executes a search.*/
    toggleSelect(selection: RangeFacetValue) {
      const analyticsAction = getAnalyticsActionForToggleSelect(selection);
      dispatch(executeSearch(analyticsAction));
    },
    /** Returns `true` if the passed value is selected, and `false` otherwise.
     * @param facetValue The facet value to check.
     * @returns boolean.
     */
    isValueSelected,
    /** @returns The state of the `Facet` controller.*/
    get state() {
      const response = facetSelector(engine.state, facetId) as R | undefined;
      const values: R['values'] = response ? response.values : [];

      return {values};
    },
  };
}
