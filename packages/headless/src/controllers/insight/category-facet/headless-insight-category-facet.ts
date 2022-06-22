import {
  buildCoreCategoryFacet,
  CategoryFacetValue,
  CoreCategoryFacetState,
} from '../../core/facets/category-facet/headless-core-category-facet';
import {CategoryFacetOptions} from '../../core/facets/category-facet/headless-core-category-facet-options';
import {Controller} from '../../controller/headless-controller';
import {CategoryFacetSortCriterion} from '../../../features/facets/category-facet-set/interfaces/request';
import {InsightEngine} from '../../../insight.index';

export interface InsightCategoryFacetOptions extends CategoryFacetOptions {}

export interface InsightCategoryFacetProps {
  /**
   * The options for  `InsightCategoryFacet` controller
   */
  options: InsightCategoryFacetOptions;
}

export interface InsightCategoryFacet extends Controller {
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
   * Sorts the facet values according to the specified criterion.
   *
   * @param criterion - The criterion by which to sort values.
   */
  sortBy(criterion: CategoryFacetSortCriterion): void;

  /**
   * Checks whether the facet values are sorted according to the specified criterion.
   *
   * @param criterion - The criterion to compare.
   * @returns Whether the facet values are sorted according to the specified criterion.
   */
  isSortedBy(criterion: CategoryFacetSortCriterion): boolean;

  /**
   * Increases the number of values displayed in the facet to the next multiple of the originally configured value.
   */
  showMoreValues(): void;

  /**
   * Sets the number of values displayed in the facet to the originally configured value.
   * */
  showLessValues(): void;

  /**
   * Enables the facet. I.e., undoes the effects of `disable`.
   */
  enable(): void;

  /**
   * Disables the facet. I.e., prevents it from filtering results.
   */
  disable(): void;

  /**
   * The state of the `Facet` controller.
   * */
  state: InsightCategoryFacetState;
}

export interface InsightCategoryFacetState extends CoreCategoryFacetState {}

/**
 * Creates a `InsightCategoryFacet` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `InsightCategoryFacet` properties.
 * @returns A `InsightCategoryFacet` controller instance.
 * */
export function buildInsightCategoryFacet(
  engine: InsightEngine,
  props: InsightCategoryFacetProps
): InsightCategoryFacet {
  const coreController = buildCoreCategoryFacet(engine, props);

  return {
    ...coreController,
    toggleSelect(selection: CategoryFacetValue) {
      coreController.toggleSelect(selection);
    },

    deselectAll() {
      coreController.deselectAll();
    },

    sortBy(criterion: CategoryFacetSortCriterion) {
      coreController.sortBy(criterion);
    },

    isSortedBy(criterion: CategoryFacetSortCriterion) {
      return coreController.isSortedBy(criterion);
    },

    showMoreValues() {
      coreController.showMoreValues();
    },

    showLessValues() {
      coreController.showLessValues();
    },

    enable() {
      coreController.enable();
    },

    disable() {
      coreController.disable();
    },

    get state() {
      return {
        ...coreController.state,
      };
    },
  };
}


