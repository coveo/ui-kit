import {StringValue, SchemaDefinition} from '@coveo/bueno';
import {
  CommerceSearchParameters,
  ProductListingParameters,
} from './search-parameter-actions';

export const searchParametersDefinition: SchemaDefinition<
  Required<CommerceSearchParameters>
> = {
  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-546: Handle only the query param for now. Add facets, sort, pagination later.
  q: new StringValue(),
};

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-546: Add facets, sort, pagination later.
export const productListingParametersDefinition: SchemaDefinition<
  Required<ProductListingParameters>
> = {};
