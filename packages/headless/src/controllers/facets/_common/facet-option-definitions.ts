import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {FacetSearchRequestOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';

/**
 * A unique identifier for the controller.
 * By default, a unique random identifier is generated.
 */
export const facetId = new StringValue();
/** The field whose values you want to display in the facet.*/
export const field = new StringValue({required: true});
/**
 * The base path shared by all values to display in the hierarchical facet.
 * If you set this option, the specified base path will always be active on the facet.
 */
export const basePath = new ArrayValue({
  each: new StringValue(),
});
/**
 * The character that specifies the hierarchical dependency.
 * @default ','
 */
export const delimitingCharacter = new StringValue();
export const filterByBasePath = new BooleanValue();
/**
 * Whether to exclude folded result parents when estimating result counts for facet values.
 */
export const filterFacetCount = new BooleanValue();
/**
 * The injection depth determines how many results to scan in the index to ensure that the facet lists all potential facet values. Increasing this value enhances the accuracy of the listed values at the cost of performance.
 * minimum: 0, maximum: 1000
 */
export const injectionDepth = new NumberValue({min: 0});
/**
 * Specifies the initial number of field values to display.
 */
export const numberOfValues = new NumberValue({min: 1});
/**
 * Whether the index should automatically create range values.
 */
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

/**
 * Options to configure a facet search
 */
export const facetSearch = new RecordValue({
  values: facetSearchOptionDefinitions,
});
