import {createSelector} from '@reduxjs/toolkit';
import {createFacetFactory} from '../common';
import {
  CommerceFacetOptions,
  DateFacetValue,
  NumericFacetValue,
  RegularFacetValue
} from '../headless-core-commerce-facet';
import {
  AnyFacetValueResponse,
  BaseFacetValue
} from '../../../../../features/commerce/facets/facet-set/interfaces/response';
import {buildController} from '../../../../controller/headless-controller';
import {FetchResultsActionCreator} from '../../common';
import {CommerceEngine, CommerceEngineState} from '../../../../../app/commerce-engine/commerce-engine';
import {
  BreadcrumbValue,
  CoreBreadcrumbManager,
  DeselectableValue
} from '../../../../breadcrumb-manager/headless-breadcrumb-manager';
import {deselectAllBreadcrumbs} from '../../../../../features/breadcrumb/breadcrumb-actions';

/**
 * Represents a generic breadcrumb type.
 *
 * This can be a `FacetBreadcrumb`, `NumericFacetBreadcrumb`, `DateFacetBreadcrumb`, or `CategoryFacetBreadcrumb`.
 */
export interface Breadcrumb<T extends BaseFacetValue> {
  /**
   * The ID of the underlying facet.
   */
  facetId: string;
  /**
   * The field on which the underlying facet is configured.
   */
  field: string;
  /**
   * The list of facet values currently selected.
   */
  values: BreadcrumbValue<T>[];
}

export type CommerceBreadcrumbBuilder<
  FacetValue extends AnyFacetValueResponse,
  // We should restrict this to only options for breadcrumbs
> = (engine: CommerceEngine, options: CommerceFacetOptions) => Breadcrumb<FacetValue>;

export interface CoreBreadcrumbManagerProps {
  options: CoreBreadcrumbManagerOptions;
}

interface CoreBreadcrumbManagerOptions {
  buildRegularFacet: CommerceBreadcrumbBuilder<RegularFacetValue>;
  buildNumericFacet: CommerceBreadcrumbBuilder<NumericFacetValue>;
  buildDateFacet: CommerceBreadcrumbBuilder<DateFacetValue>;
  fetchResultsActionCreator: FetchResultsActionCreator;
}

interface BreadcrumbManagerState {
  /**
   * The list of facet breadcrumbs.
   */
  facetBreadcrumbs: Breadcrumb<AnyFacetValueResponse>[]; // or Breadcrumb<RegularFacetValue> | Breadcrumb<NumericFacetValue> | Breadcrumb<DateFacetValue>

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
}

export function buildCoreBreadcrumbManager(
  engine: CommerceEngine,
  props: CoreBreadcrumbManagerProps
): BreadcrumbManager {
  // TODO(nico): Declare reducers usage
  const controller = buildController(engine);
  const {dispatch} = engine;

  const commerceFacetSelector = createSelector(
    (state: CommerceEngineState) => state.facetOrder,
    (facetOrder): BreadcrumbManagerState => {

      const breadcrumbs = facetOrder.map(createFacet) ?? [];
      return {
        facetBreadcrumbs: breadcrumbs,
        hasBreadcrumbs: breadcrumbs.length > 0
      };
    }
  );

  const builders = {
    numericalRange: (facetId: string) => props.options.buildNumericFacet(engine, {facetId}),
    dateRange: (facetId: string) => props.options.buildDateFacet(engine, {facetId}),
    // TODO return options.buildCategoryFacet(engine, {facetId});
    hierarchical: (facetId: string) => props.options.buildRegularFacet(engine, {facetId}),
    regular: (facetId: string) => props.options.buildRegularFacet(engine, {facetId})
  };

  const createFacet = createFacetFactory<Breadcrumb<AnyFacetValueResponse>>(
    (facetId) => engine.state.commerceFacetSet[facetId].request.type, builders);

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
