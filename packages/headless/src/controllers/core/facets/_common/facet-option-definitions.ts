import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  type SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import type {FacetSearchRequestOptions} from '../../../../api/search/facet-search/base/base-facet-search-request.js';

export const facetId = new StringValue({
  regex: /^[a-zA-Z0-9-_]+$/,
});
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

const captions = new RecordValue();
const query = new StringValue();

const facetSearchOptionDefinitions: SchemaDefinition<FacetSearchRequestOptions> =
  {
    captions,
    numberOfValues,
    query,
  };

export const facetSearch = new RecordValue({
  values: facetSearchOptionDefinitions,
});

export const allowedValues = new RecordValue({
  options: {required: false},
  values: {
    type: new StringValue({
      constrainTo: ['simple'],
      emptyAllowed: false,
      required: true,
    }),
    values: new ArrayValue({
      required: true,
      max: 25,
      each: new StringValue({emptyAllowed: false, required: true}),
    }),
  },
});

export const hasBreadcrumbs = new BooleanValue();

export const customSort = new ArrayValue({
  min: 1,
  max: 25,
  required: false,
  each: new StringValue({emptyAllowed: false, required: true}),
});
