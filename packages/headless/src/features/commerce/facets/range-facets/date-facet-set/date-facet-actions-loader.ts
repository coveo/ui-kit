import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  deselectAllDateFacetValues,
  registerDateFacet,
  RegisterDateFacetActionCreatorPayload,
  toggleSelectDateFacetValue,
  ToggleSelectDateFacetValueActionCreatorPayload,
  updateDateFacetSortCriterion,
  UpdateDateFacetSortCriterionActionCreatorPayload,
  UpdateDateFacetValuesActionCreatorPayload,
  updateDateFacetValues,
  toggleExcludeDateFacetValue,
} from '../../../../facets/range-facets/date-facet-set/date-facet-actions';
import {DateFacetSetActionCreators} from '../../../../facets/range-facets/date-facet-set/date-facet-actions-loader';
import {dateFacetSetReducer as dateFacet} from '../../../../facets/range-facets/date-facet-set/date-facet-set-slice';

export type {
  RegisterDateFacetActionCreatorPayload,
  ToggleSelectDateFacetValueActionCreatorPayload,
  UpdateDateFacetSortCriterionActionCreatorPayload,
  UpdateDateFacetValuesActionCreatorPayload,
};

/**
 * Loads the `dateFacetSet` reducer and returns possible action creators.
 *
 * @param engine - The commerce headless engine.
 * @returns An object holding the action creators.
 *
 * @internal
 */
export function loadDateFacetSetActions(
  engine: CommerceEngine
): DateFacetSetActionCreators {
  engine.addReducers({dateFacet});

  return {
    deselectAllDateFacetValues,
    registerDateFacet,
    toggleSelectDateFacetValue,
    toggleExcludeDateFacetValue,
    updateDateFacetSortCriterion,
    updateDateFacetValues,
  };
}
