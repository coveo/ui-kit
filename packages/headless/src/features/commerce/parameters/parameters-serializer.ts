import {
  castUnknownObject,
  delimiter, isValidKey,
  preprocessObjectPairs,
  serializePair,
  splitOnFirstEqual,
} from '../../search-parameters/search-parameter-serializer';
import {serialize as coreSerialize} from '../../search-parameters/search-parameter-serializer';
import {
  Parameters,
} from './parameters-actions';
import {ProductListingParameters} from '../product-listing-parameters/product-listing-parameter-actions';
import {CommerceSearchParameters} from '../search-parameters/search-parameters-actions';

export interface Serializer<T extends Parameters> {
  serialize: (parameters: T) => string;
  deserialize: (fragment: string) => T;
}

export const searchSerializer: Serializer<CommerceSearchParameters> = {
  serialize,
  deserialize,
};

export const productListingSerializer = {
  serialize,
  deserialize: () => ({}) as ProductListingParameters,
} as Serializer<ProductListingParameters>;

type FacetSearchParameters = keyof Pick<
  CommerceSearchParameters,
  'f' | 'cf' | 'nf' | 'df'
>;

type FacetKey = keyof typeof supportedFacetParameters;
const supportedFacetParameters: Record<FacetSearchParameters, boolean> = {
  f: true,
  cf: true,
  nf: true,
  df: true,
};

function serialize(parameters: CommerceSearchParameters): string {
  return coreSerialize(serializePair)(parameters);
}

function deserialize(fragment: string): CommerceSearchParameters {
  const parts = fragment.split(delimiter);
  const keyValuePairs = parts
    .map(splitOnFirstEqual)
    .map(preprocessObjectPairs)
    .filter(isValidPair)
    .map(cast);

  return keyValuePairs.reduce((acc: CommerceSearchParameters, pair) => {
    const [key, val] = pair;

    if (keyHasObjectValue(key)) {
      const mergedValues = {...acc[key], ...(val as object)};
      return {...acc, [key]: mergedValues};
    }

    return {...acc, [key]: val};
  }, {});
}

export function keyHasObjectValue(key: string): key is FacetKey {
  return key in supportedFacetParameters;
}

function isValidPair<K extends keyof CommerceSearchParameters>(
  pair: string[]
): pair is [K, string] {
  const validKey = isValidKey(pair[0]);
  const lengthOfTwo = pair.length === 2;
  return validKey && lengthOfTwo;
}

function cast<K extends keyof CommerceSearchParameters>(
  pair: [K, string]
): [K, unknown] {
  const [key, value] = pair;

  if (key === 'page' || key === 'perPage') {
    return [key, parseInt(value)];
  }

  if (keyHasObjectValue(key)) {
    return [key, castUnknownObject(value)];
  }

  return [key, decodeURIComponent(value)];
}
