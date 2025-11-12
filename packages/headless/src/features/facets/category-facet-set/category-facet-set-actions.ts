import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
  Value,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../utils/validate-payload.js';
import {facetIdDefinition} from '../generic/facet-actions-validation.js';
import {validateCategoryFacetValue} from './category-facet-validate-payload.js';
import type {CategoryFacetSortCriterion} from './interfaces/request.js';
import type {CategoryFacetValue} from './interfaces/response.js';

export interface RegisterCategoryFacetActionCreatorPayload {
  /**
   * A unique identifier for the facet.
   * */
  facetId: string;

  /**
   * The field from which to display values in the facet.
   * */
  field: string;

  /**
   * The tabs on which the facet should be enabled or disabled.
   */
  tabs?: {included?: string[]; excluded?: string[]};

  /**
   * @deprecated - This field is unused and should not be relied on.
   * If you need the currently active tab, use the TabManager instead.
   *
   * This property will be removed in version 4.0.
   */
  activeTab?: string;

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
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high `injectionDepth` may negatively impact the facet request performance.
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
   * @defaultValue `occurrences`
   */
  sortCriteria?: CategoryFacetSortCriterion;
}

const categoryFacetPayloadDefinition = {
  facetId: facetIdDefinition,
  field: requiredNonEmptyString,
  tabs: new RecordValue({
    options: {
      required: false,
    },
    values: {
      included: new ArrayValue({each: new StringValue()}),
      excluded: new ArrayValue({each: new StringValue()}),
    },
  }),
  activeTab: new StringValue({required: false}),
  delimitingCharacter: new StringValue({required: false, emptyAllowed: true}),
  filterFacetCount: new BooleanValue({required: false}),
  injectionDepth: new NumberValue({required: false, min: 0}),
  numberOfValues: new NumberValue({required: false, min: 1}),
  sortCriteria: new Value<CategoryFacetSortCriterion>({required: false}),
  basePath: new ArrayValue({required: false, each: requiredNonEmptyString}),
  filterByBasePath: new BooleanValue({required: false}),
};

export const defaultNumberOfValuesIncrement = 5;

export const registerCategoryFacet = createAction(
  'categoryFacet/register',
  (payload: RegisterCategoryFacetActionCreatorPayload) =>
    validatePayload(payload, categoryFacetPayloadDefinition)
);

export interface ToggleSelectCategoryFacetValueActionCreatorPayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
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

export const toggleSelectCategoryFacetValue = createAction(
  'categoryFacet/toggleSelectValue',
  (payload: ToggleSelectCategoryFacetValueActionCreatorPayload) => {
    try {
      validatePayloadAndThrow(payload.facetId, requiredNonEmptyString);
      validateCategoryFacetValue(payload.selection);
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error as Error)};
    }
  }
);

export const deselectAllCategoryFacetValues = createAction(
  'categoryFacet/deselectAll',
  (payload: string) =>
    validatePayload(payload, categoryFacetPayloadDefinition.facetId)
);

export interface UpdateCategoryFacetNumberOfValuesActionCreatorPayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;

  /**
   * The new number of facet values (for example, `10`).
   */
  numberOfValues: number;
}

export const updateCategoryFacetNumberOfValues = createAction(
  'categoryFacet/updateNumberOfValues',
  (payload: UpdateCategoryFacetNumberOfValuesActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: categoryFacetPayloadDefinition.facetId,
      numberOfValues: categoryFacetPayloadDefinition.numberOfValues,
    })
);

export interface UpdateCategoryFacetSortCriterionActionCreatorPayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;

  /**
   * The criterion by which to sort the facet.
   */
  criterion: CategoryFacetSortCriterion;
}

export const updateCategoryFacetSortCriterion = createAction(
  'categoryFacet/updateSortCriterion',
  (payload: UpdateCategoryFacetSortCriterionActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: categoryFacetPayloadDefinition.facetId,
      criterion: new Value<CategoryFacetSortCriterion>(),
    })
);

export interface UpdateCategoryFacetBasePathActionCreatorPayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;

  /**
   * The base path shared by all values for the facet.
   */
  basePath: string[];
}

export const updateCategoryFacetBasePath = createAction(
  'categoryFacet/updateBasePath',
  (payload: UpdateCategoryFacetBasePathActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: categoryFacetPayloadDefinition.facetId,
      basePath: new ArrayValue({each: requiredNonEmptyString}),
    })
);
