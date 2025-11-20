import {createSelector} from '@reduxjs/toolkit';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {
  clearAllCoreFacets,
  deselectAllValuesInCoreFacet,
  updateCoreFacetFreezeCurrentValues,
} from '../../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../../features/commerce/facets/date-facet/date-facet-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice.js';
import type {FacetType} from '../../../../features/commerce/facets/facet-set/interfaces/common.js';
import type {
  AnyFacetResponse,
  AnyFacetValueResponse,
  BaseFacetValue,
  CategoryFacetResponse,
  DateFacetResponse,
  LocationFacetResponse,
  NumericFacetResponse,
  RegularFacetResponse,
} from '../../../../features/commerce/facets/facet-set/interfaces/response.js';
import {toggleSelectLocationFacetValue} from '../../../../features/commerce/facets/location-facet/location-facet-actions.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../features/commerce/facets/numeric-facet/numeric-facet-actions.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../features/commerce/facets/regular-facet/regular-facet-actions.js';
import {findActiveValueAncestry} from '../../../../features/facets/category-facet-set/category-facet-utils.js';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice.js';
import type {
  CommerceFacetSetSection,
  FacetOrderSection,
} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import type {
  BreadcrumbValue,
  CoreBreadcrumbManager,
  DeselectableValue,
} from '../../../breadcrumb-manager/headless-breadcrumb-manager.js';
import {buildController} from '../../../controller/headless-controller.js';
import type {ToggleActionCreator} from '../common.js';
import type {CoreCommerceFacetOptions} from '../facets/headless-core-commerce-facet.js';

export type {BreadcrumbValue, DeselectableValue};

/**
 * Represents a generic breadcrumb type.
 *
 * @group Sub-controllers
 * @category BreadcrumbManager
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
  'facetResponseSelector' | 'fetchProductsActionCreator'
>;

/**
 * A scoped and simplified part of the headless state that is relevant to the `BreadcrumbManager` sub-controller.
 *
 * @group Sub-controllers
 * @category BreadcrumbManager
 */
export interface BreadcrumbManagerState {
  /**
   * The list of facet breadcrumbs.
   */
  facetBreadcrumbs: Breadcrumb<AnyFacetValueResponse>[];

  /**
   * Whether any breadcrumbs are available (that is, if any facet values are currently active).
   */
  hasBreadcrumbs: boolean;
}

/**
 * The `BreadcrumbManager` sub-controller manages a summary of the currently active facet filters.
 */
export type BreadcrumbManager = Omit<
  CoreBreadcrumbManager,
  'deselectBreadcrumb' | 'state'
> & {
  /**
   * The state of the `BreadcrumbManager` sub-controller.
   */
  state: BreadcrumbManagerState;
};

interface ActionCreators {
  toggleSelectActionCreator: ToggleActionCreator;
  toggleExcludeActionCreator?: ToggleActionCreator;
}

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
  location: {
    toggleSelectActionCreator: toggleSelectLocationFacetValue,
  },
  hierarchical: {
    toggleSelectActionCreator: deselectAllValuesInCoreFacet,
  },
};

/**
 * @internal
 * Creates a `BreadcrumbManager` sub-controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `BreadcrumbManager` options used internally.
 * @returns A `BreadcrumbManager` sub-controller.
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
    values:
      facet.type === 'hierarchical'
        ? getValuesForCategoryFacet(facet)
        : getValuesForNonCategoryFacet(facet),
  });

  const getValuesForNonCategoryFacet = (
    facet:
      | RegularFacetResponse
      | NumericFacetResponse
      | DateFacetResponse
      | LocationFacetResponse
  ) => {
    return facet.values
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

            if (facet.type !== 'location') {
              dispatch(
                updateCoreFacetFreezeCurrentValues({
                  facetId: facet.facetId,
                  freezeCurrentValues: false,
                })
              );
            }
            dispatch(options.fetchProductsActionCreator());
          } else if (
            selection.state === 'excluded' &&
            facet.type !== 'location'
          ) {
            dispatch(
              actions[facet.type].toggleExcludeActionCreator!({
                facetId: facet.facetId,
                selection,
              })
            );
            dispatch(
              updateCoreFacetFreezeCurrentValues({
                facetId: facet.facetId,
                freezeCurrentValues: false,
              })
            );
            dispatch(options.fetchProductsActionCreator());
          }
        },
      }));
  };

  const getValuesForCategoryFacet = (facet: CategoryFacetResponse) => {
    const ancestry = findActiveValueAncestry(facet.values);
    const activeValue =
      ancestry.length > 0 ? ancestry[ancestry.length - 1] : undefined;

    if (activeValue === undefined) {
      return [];
    }

    return [
      {
        value: activeValue,
        deselect: () => {
          dispatch(
            actions.hierarchical.toggleSelectActionCreator({
              facetId: facet.facetId,
            })
          );
          dispatch(options.fetchProductsActionCreator());
        },
      },
    ];
  };

  const hasActiveValue = (
    facet: AnyFacetResponse | undefined
  ): facet is AnyFacetResponse => {
    if (!facet) {
      return false;
    }
    if (facet.values.length === 0) {
      return false;
    }
    if (facet.type === 'hierarchical') {
      return findActiveValueAncestry(facet.values).length > 0;
    }

    return facet.values.some((value) => value.state !== 'idle');
  };

  const commerceFacetSelector = createSelector(
    (state: CommerceEngineState) => state.facetOrder,
    (facetOrder): BreadcrumbManagerState => {
      const breadcrumbs = facetOrder.flatMap((facetId) => {
        const facet = options.facetResponseSelector(engine[stateKey], facetId);

        if (hasActiveValue(facet)) {
          return [createBreadcrumb(facet)];
        }
        return [];
      });

      return {
        facetBreadcrumbs: breadcrumbs,
        hasBreadcrumbs: breadcrumbs.length > 0,
      };
    }
  );

  return {
    ...controller,

    deselectAll: () => {
      dispatch(clearAllCoreFacets());
      dispatch(options.fetchProductsActionCreator());
    },

    get state() {
      return commerceFacetSelector(engine[stateKey]);
    },
  };
}

function loadCommerceBreadcrumbManagerReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetOrderSection & CommerceFacetSetSection> {
  engine.addReducers({facetOrder, commerceFacetSet});
  return true;
}
