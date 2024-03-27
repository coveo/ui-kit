import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {deselectAllBreadcrumbs} from '../../../../features/breadcrumb/breadcrumb-actions';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {
  AnyFacetValueResponse,
  BaseFacetValue,
  FacetType,
} from '../../../../features/commerce/facets/facet-set/interfaces/response';
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
import {facetResponseSelector} from '../../product-listing/facets/headless-product-listing-facet-options';
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

interface BreadcrumbManagerState {
  /**
   * The list of facet breadcrumbs.
   */
  facetBreadcrumbs: Breadcrumb<AnyFacetValueResponse>[];

  /**
   * Returns `true` if there are any available breadcrumbs (i.e., if there are any active facet values), and `false` if not.
   */
  hasBreadcrumbs: boolean;
}

export type BreadcrumbManager = Omit<CoreBreadcrumbManager, 'state'> & {
  /**
   * The state of the `BreadcrumbManager` controller.
   */
  state: BreadcrumbManagerState;
};

interface ActionCreators {
  toggleSelectActionCreator: ToggleActionCreator;
  toggleExcludeActionCreator: ToggleActionCreator;
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
  hierarchical: {
    // TODO: Support category facets
    toggleSelectActionCreator: toggleSelectFacetValue,
    toggleExcludeActionCreator: toggleExcludeFacetValue,
  },
};

export function buildCoreBreadcrumbManager(
  engine: CommerceEngine,
  options: CoreBreadcrumbManagerOptions
): BreadcrumbManager {
  if (!loadCommerceBreadcrumbManagerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const createBreadcrumb = (facetId: string) => {
    const facet = facetResponseSelector(engine.state, facetId);

    if (!facet) {
      return {
        facetId,
        field: '',
        type: 'regular',
        values: [],
      };
    }

    return {
      facetId,
      field: facet.field,
      type: facet.type,
      values: facet.values
        .filter((value) => value.state !== 'idle')
        .map((selection) => ({
          value: selection,
          deselect: () => {
            if (selection.state === 'selected') {
              // TODO: Do we need to handle freezing values?
              dispatch(
                actions[facet.type].toggleSelectActionCreator({
                  facetId,
                  selection,
                })
              );
              dispatch(options.fetchResultsActionCreator());
            } else if (selection.state === 'excluded') {
              dispatch(
                actions[facet.type].toggleExcludeActionCreator({
                  facetId,
                  selection,
                })
              );
              dispatch(options.fetchResultsActionCreator());
            }
          },
        })),
    };
  };

  const commerceFacetSelector = createSelector(
    (state: CommerceEngineState) => state.facetOrder,
    (facetOrder): BreadcrumbManagerState => {
      const breadcrumbs = facetOrder.map(createBreadcrumb) ?? [];
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

    deselectBreadcrumb(value: DeselectableValue) {
      value.deselect();
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
