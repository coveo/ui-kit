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

export const delimitingCharacter = new StringValue();
export const filterByBasePath = new BooleanValue();
export const filterFacetCount = new BooleanValue();
export const injectionDepth = new NumberValue({min: 0});
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
