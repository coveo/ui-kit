import {createAction} from '@reduxjs/toolkit';
import {CategoryFacetValue} from './interfaces/response';
import {CategoryFacetSortCriterion} from './interfaces/request';
import {
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {
  Value,
  BooleanValue,
  ArrayValue,
  StringValue,
  NumberValue,
} from '@coveo/bueno';
import {validateCategoryFacetValue} from './category-facet-validate-payload';

export interface RegisterCategoryFacetActionCreatorPayload {
  /**
   * A unique identifier for the controller. By default, a random unique identifier is generated.
   * */
  facetId: string;

  /**
   * The field whose values you want to display in the facet.
   * */
  field: string;

  /**
   * The base path shared by all values for the facet.
   *
   * @defaultValue `[]`
   */
  basePath?: string[];

  /**
   * The character that specifies the hierarchical dependency.
   *
   * @defaultValue `;`
   */
  delimitingCharacter?: string;

  /**
   * Whether to use basePath as a filter for the results.
   *
   * @defaultValue `true`
   */
  filterByBasePath?: boolean;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high injectionDepth may negatively impact the facet request performance.
   *
   * Minimum: `0`
   *
   * @defaultValue `1000`
   * */
  injectionDepth?: number;

  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   *
   * Minimum: `1`
   *
   * @defaultValue `5`
   */
  numberOfValues?: number;

  /**
   * The criterion to use for sorting returned facet values.
   *
   * @defaultValue `occurences`
   */
  sortCriteria?: CategoryFacetSortCriterion;
}

const registerCategoryFacetPayloadDefinition = {
  facetId: facetIdDefinition,
  field: requiredNonEmptyString,
  delimitingCharacter: new StringValue({required: false, emptyAllowed: true}),
  filterFacetCount: new BooleanValue({required: false}),
  injectionDepth: new NumberValue({required: false, min: 0}),
  numberOfValues: new NumberValue({required: false, min: 1}),
  sortCriteria: new Value<CategoryFacetSortCriterion>({required: false}),
  basePath: new ArrayValue({required: false, each: requiredNonEmptyString}),
  filterByBasePath: new BooleanValue({required: false}),
};

/**
 * Registers a category facet in the category facet set.
 * @param (RegisterCategoryFacetActionCreatorPayload) The options to register the category facet with.
 */
export const registerCategoryFacet = createAction(
  'categoryFacet/register',
  (payload: RegisterCategoryFacetActionCreatorPayload) =>
    validatePayload(payload, registerCategoryFacetPayloadDefinition)
);

export interface ToggleSelectCategoryFacetValueActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The target category facet value.
   */
  selection: CategoryFacetValue;

  /**
   * The number of child values to display.
   */
  retrieveCount: number;
}

/**
 * Toggles a category facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (CategoryFacetValue) The target category facet value.
 */
export const toggleSelectCategoryFacetValue = createAction(
  'categoryFacet/toggleSelectValue',
  (payload: ToggleSelectCategoryFacetValueActionCreatorPayload) => {
    try {
      validatePayloadAndThrow(payload.facetId, requiredNonEmptyString);
      validateCategoryFacetValue(payload.selection);
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error)};
    }
  }
);

/** Deselects all values of a category facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllCategoryFacetValues = createAction(
  'categoryFacet/deselectAll',
  (payload: string) => validatePayload(payload, facetIdDefinition)
);

export interface UpdateCategoryFacetNumberOfValuesActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The new number of facet values (e.g., `10`).
   */
  numberOfValues: number;
}

/** Updates the number of values of a category facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param numberOfValues (number) The new number of facet values (e.g., `10`).
 */
export const updateCategoryFacetNumberOfValues = createAction(
  'categoryFacet/updateNumberOfValues',
  (payload: UpdateCategoryFacetNumberOfValuesActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      numberOfValues: new NumberValue({required: true, min: 1}),
    })
);

export interface UpdateCategoryFacetSortCriterionActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The criterion by which to sort the facet.
   */
  criterion: CategoryFacetSortCriterion;
}

/**
 * Updates the the sort criterion for the category facet
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (FacetSortCriterion) The criterion by which to sort the facet.
 */
export const updateCategoryFacetSortCriterion = createAction(
  'categoryFacet/updateSortCriterion',
  (payload: UpdateCategoryFacetSortCriterionActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<CategoryFacetSortCriterion>(),
    })
);
