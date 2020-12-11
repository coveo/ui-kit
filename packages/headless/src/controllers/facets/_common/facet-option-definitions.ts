import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request';

/**
 * A unique identifier for the controller.
 * By default, a unique random identifier is generated.
 */
export const facetId = new StringValue({
  regex: /^[a-zA-Z0-9-_]+$/,
});
/** The field whose values you want to display in the facet.*/
export const field = new StringValue({required: true});
export const basePath = new ArrayValue({
  each: new StringValue(),
});

/**
 * The character that specifies the hierarchical dependency.
 */
export const delimitingCharacter = new StringValue();
export const filterByBasePath = new BooleanValue();
/**
 * Whether to exclude folded result parents when estimating result counts for facet values.
 */
export const filterFacetCount = new BooleanValue();
/**
 * The number of items to scan for facet values.
 * Setting this option to a higher value may enhance the accuracy of facet value counts at the cost of slower query performance.
 * @minimum 0
 */
export const injectionDepth = new NumberValue({min: 0});
/**
 * The number of values to request for this facet.
 * Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
 * @minimum 1
 */
export const numberOfValues = new NumberValue({min: 1});
export const generateAutomaticRanges = new BooleanValue({
  required: true,
}) as never;

export const captions = new RecordValue();
export const query = new StringValue();

const facetSearchOptionDefinitions: SchemaDefinition<FacetSearchRequestOptions> = {
  captions,
  numberOfValues,
  query,
};

export const facetSearch = new RecordValue({
  values: facetSearchOptionDefinitions,
});
