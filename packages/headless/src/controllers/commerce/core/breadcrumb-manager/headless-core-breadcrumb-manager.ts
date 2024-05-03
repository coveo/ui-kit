import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {deselectAllBreadcrumbs} from '../../../../features/breadcrumb/breadcrumb-actions';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {FacetType} from '../../../../features/commerce/facets/facet-set/interfaces/common';
import {
  AnyFacetResponse,
  AnyFacetValueResponse,
  BaseFacetValue,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
import {toggleSelectCategoryFacetValue} from '../../../../features/facets/category-facet-set/category-facet-set-actions';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../features/facets/facet-set/facet-set-actions';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {
  CommerceFacetSetSection,
  FacetOrderSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  BreadcrumbValue,
  CoreBreadcrumbManager,
  DeselectableValue,
} from '../../../breadcrumb-manager/headless-breadcrumb-manager';
import {buildController} from '../../../controller/headless-controller';
import {ToggleActionCreator} from '../common';
import {CoreCommerceFacetOptions} from '../facets/headless-core-commerce-facet';

export type {BreadcrumbValue, DeselectableValue};

/**
 * Represents a generic breadcrumb type.
 */
export interface Breadcrumb<Value extends BaseFacetValue> {
  /**
   * The ID of the underlying facet.
   */
  facetId: string;
  /**
   * The display name of the underlying facet.
   */
  facetDisplayName: string;
  /**
   * The field on which the underlying facet is configured.
   */
  field: string;
  /**
   * The type of the underlying facet.
   */
  type: string;
  /**
   * The list of facet values currently selected.
   */
  values: BreadcrumbValue<Value>[];
}

export type CoreBreadcrumbManagerOptions = Pick<
  CoreCommerceFacetOptions,
  'facetResponseSelector' | 'fetchResultsActionCreator'
>;

/**
 * A scoped and simplified part of the headless state that is relevant to the `BreadcrumbManager` controller.
 */
interface BreadcrumbManagerState {
  /**
   * The list of facet breadcrumbs.
   */
  facetBreadcrumbs: Breadcrumb<AnyFacetValueResponse>[];

  /**
   * Whether any breadcrumbs are available (i.e., if any facet values are currently active).
   */
  hasBreadcrumbs: boolean;
}

/**
 * The `BreadcrumbManager` controller manages a summary of the currently active facet filters.
 */
export type BreadcrumbManager = Omit<
  CoreBreadcrumbManager,
  'deselectBreadcrumb' | 'state'
> & {
  /**
   * The state of the `BreadcrumbManager` controller.
   */
  state: BreadcrumbManagerState;
};

interface ActionCreators {
  toggleSelectActionCreator: ToggleActionCreator;
  toggleExcludeActionCreator?: ToggleActionCreator;
}

const facetTypeWithoutExcludeAction: FacetType = 'hierarchical';

const actions: Record<FacetType, ActionCreators> = {
  regular: {
    toggleSelectActionCreator: toggleSelectFacetValue,
    toggleExcludeActionCreator: toggleExcludeFacetValue,
  },
  numericalRange: {
    toggleSelectActionCreator: toggleSelectNumericFacetValue,
    toggleExcludeActionCreator: toggleExcludeNumericFacetValue,
  },
  dateRange: {
    toggleSelectActionCreator: toggleSelectDateFacetValue,
    toggleExcludeActionCreator: toggleExcludeDateFacetValue,
  },
  [facetTypeWithoutExcludeAction]: {
    toggleSelectActionCreator: toggleSelectCategoryFacetValue,
  },
};

/**
 * @internal
 * Creates a `BreadcrumbManager` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `BreadcrumbManager` options used internally.
 * @returns A `BreadcrumbManager` controller instance.
 **/
export function buildCoreBreadcrumbManager(
  engine: CommerceEngine,
  options: CoreBreadcrumbManagerOptions
): BreadcrumbManager {
  if (!loadCommerceBreadcrumbManagerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const createBreadcrumb = (facet: AnyFacetResponse) => ({
    facetId: facet.facetId,
    facetDisplayName: facet.displayName,
    field: facet.field,
    type: facet.type,
    values: facet.values
      .filter((value) => value.state !== 'idle')
      .map((selection) => ({
        value: selection,
        deselect: () => {
          if (selection.state === 'selected') {
            dispatch(
              actions[facet.type].toggleSelectActionCreator({
                facetId: facet.facetId,
                selection,
              })
            );
            dispatch(options.fetchResultsActionCreator());
          } else if (
            selection.state === 'excluded' &&
            facet.type !== facetTypeWithoutExcludeAction
          ) {
            dispatch(
              actions[facet.type].toggleExcludeActionCreator!({
                facetId: facet.facetId,
                selection,
              })
            );
            dispatch(options.fetchResultsActionCreator());
          }
        },
      })),
  });

  const commerceFacetSelector = createSelector(
    (state: CommerceEngineState) => state.facetOrder,
    (facetOrder): BreadcrumbManagerState => {
      const breadcrumbs =
        facetOrder
          .map((facetId) =>
            options.facetResponseSelector(engine.state, facetId)
          )
          .filter((facet): facet is AnyFacetResponse => facet !== undefined)
          .map(createBreadcrumb) ?? [];
      return {
        facetBreadcrumbs: breadcrumbs,
        hasBreadcrumbs: breadcrumbs.length > 0,
      };
    }
  );

  return {
    ...controller,

    deselectAll: () => {
      dispatch(deselectAllBreadcrumbs());
    },

    get state() {
      return commerceFacetSelector(engine.state);
    },
  };
}

function loadCommerceBreadcrumbManagerReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetOrderSection & CommerceFacetSetSection> {
  engine.addReducers({facetOrder, commerceFacetSet});
  return true;
}
