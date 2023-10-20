import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  commerceCategoryFacetResponseSelector,
  isCommerceCategoryFacetLoadingResponseSelector,
} from '../../../../features/commerce/facets/category-facet-set/category-facet-set-selectors';
import {
  commerceCategoryFacetSetReducer as commerceCategoryFacetSet,
  defaultCommerceCategoryFacetOptions,
} from '../../../../features/commerce/facets/category-facet-set/category-facet-set-slice';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {
  deselectAllCategoryFacetValues,
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../features/facets/category-facet-set/category-facet-set-actions';
import {findActiveValueAncestry} from '../../../../features/facets/category-facet-set/category-facet-utils';
import {
  CommerceCategoryFacetSection,
  ProductListingV2Section,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {validateOptions} from '../../../../utils/validate-payload';
import {
  Controller,
  buildController,
} from '../../../controller/headless-controller';
import {determineFacetId} from '../../../core/facets/_common/facet-id-determinor';
import {CategoryFacetValue} from '../../../core/facets/category-facet/headless-core-category-facet';
import {
  CommerceCategoryFacetOptions,
  commerceCategoryFacetOptionsSchema,
} from './headless-commerce-category-facet-options';

export interface CommerceCategoryFacetProps {
  /** The options for the `CommerceCategoryFacet` controller. */
  options: CommerceCategoryFacetOptions;
}

/**
 * The `CommerceCategoryFacet` headless controller offers a high-level interface for designing a facet UI controller that renders values hierarchically.
 */
export interface CommerceCategoryFacet extends Controller {
  /**
   * Toggles the specified facet value.
   *
   * @param selection - The facet value to toggle.
   */
  toggleSelect(selection: CategoryFacetValue): void;

  /**
   * Deselects all facet values.
   * */
  deselectAll(): void;

  /**
   * Increases the number of values displayed in the facet to the next multiple of the originally configured value.
   */
  showMoreValues(): void;

  /**
   * Sets the number of values displayed in the facet to the originally configured value.
   * */
  showLessValues(): void;

  /**
   * The state of the `CommerceCategoryFacet` controller.
   * */
  state: CommerceCategoryFacetState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `CommerceCategoryFacet` controller.
 */
export interface CommerceCategoryFacetState {
  /**
   * The facet ID.
   */
  facetId: string;

  /**
   * A tree representation of the category facet values.
   */
  valuesAsTrees: CategoryFacetValue[];

  /**
   * The selected facet value, if any.
   */
  activeValue: CategoryFacetValue | undefined;

  /**
   * Whether `valuesAsTree` contains facet values with children.
   */
  isHierarchical: boolean;

  /**
   * The ancestry of the  selected facet value.
   * The first element is the root ancestor of the selected facet value.
   * The last element is the selected facet value itself.
   */
  selectedValueAncestry: CategoryFacetValue[];

  /**
   * Whether the controller is waiting for a response from the Commerce API.
   * */
  isLoading: boolean;

  /**
   * Whether a facet value is selected.
   * */
  hasActiveValues: boolean;

  /**
   * Whether additional facet values can be requested.
   */
  canShowMoreValues: boolean;

  /**
   * Whether fewer facet values can be requested.
   */
  canShowLessValues: boolean;
}

/**
 * Creates a `CommerceCategoryFacet` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `CommerceCategoryFacet` properties.
 * @returns A `CommerceCategoryFacet` controller instance.
 * */
export function buildCommerceCategoryFacet(
  engine: CommerceEngine,
  props: CommerceCategoryFacetProps
): CommerceCategoryFacet {
  if (!loadCommerceCategoryFacetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const facetId = determineFacetId(engine, props.options);
  const registrationOptions = {
    ...defaultCommerceCategoryFacetOptions,
    ...props.options,
    facetId,
  };

  const options: Required<CommerceCategoryFacetOptions> = {
    ...registrationOptions,
  };

  validateOptions(
    engine,
    commerceCategoryFacetOptionsSchema,
    options,
    'buildCommerceCategoryFacet'
  );

  const getResponse = () => {
    return commerceCategoryFacetResponseSelector(engine.state, facetId);
  };

  const getIsLoading = () =>
    isCommerceCategoryFacetLoadingResponseSelector(engine.state);

  dispatch(registerCategoryFacet(registrationOptions));

  return {
    ...controller,

    toggleSelect(selection: CategoryFacetValue) {
      const retrieveCount = options.numberOfValues;
      dispatch(
        toggleSelectCategoryFacetValue({facetId, selection, retrieveCount})
      );
      dispatch(updateFacetOptions());
    },

    deselectAll() {
      dispatch(deselectAllCategoryFacetValues(facetId));
      dispatch(updateFacetOptions());
    },

    showMoreValues() {
      const {numberOfValues: increment} = options;
      const {activeValue, valuesAsTrees} = this.state;
      const numberOfValues =
        (activeValue?.children.length ?? valuesAsTrees.length) + increment;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions());
    },

    showLessValues() {
      const {numberOfValues} = options;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(updateFacetOptions());
    },

    get state() {
      const response = getResponse();
      const isLoading = getIsLoading();
      const valuesAsTrees = response?.values ?? [];
      const isHierarchical =
        valuesAsTrees.some((value) => value.children.length > 0) ?? false;
      const selectedValueAncestry = findActiveValueAncestry(valuesAsTrees);
      const activeValue = selectedValueAncestry.length
        ? selectedValueAncestry[selectedValueAncestry.length - 1]
        : undefined;
      const hasActiveValues = !!activeValue;
      const canShowMoreValues =
        activeValue?.moreValuesAvailable ??
        response?.moreValuesAvailable ??
        false;
      const canShowLessValues = activeValue
        ? activeValue.children.length > options.numberOfValues
        : valuesAsTrees.length > options.numberOfValues;

      return {
        facetId,
        valuesAsTrees,
        activeValue,
        isHierarchical,
        selectedValueAncestry,
        isLoading,
        hasActiveValues,
        canShowMoreValues,
        canShowLessValues,
      };
    },
  };
}

function loadCommerceCategoryFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  CommerceCategoryFacetSection & ProductListingV2Section
> {
  engine.addReducers({
    productListing,
    commerceCategoryFacetSet,
  });
  return true;
}
