import {
  castUnknownObject,
  delimiter,
  isValidKey,
  preprocessObjectPairs,
  serializePair,
  splitOnFirstEqual,
} from '../../search-parameters/search-parameter-serializer';
import {serialize as coreSerialize} from '../../search-parameters/search-parameter-serializer';
import {ProductListingParameters} from '../product-listing-parameters/product-listing-parameter-actions';
import {CommerceSearchParameters} from '../search-parameters/search-parameters-actions';
import {Parameters} from './parameters-actions';

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
  deserialize,
} as Serializer<ProductListingParameters>;

type FacetParameters = keyof Pick<Parameters, 'f' | 'cf' | 'nf' | 'df'>;

type FacetKey = keyof typeof supportedFacetParameters;
const supportedFacetParameters: Record<FacetParameters, boolean> = {
  f: true,
  cf: true,
  nf: true,
  df: true,
};

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-907: Handle sort and pagination
function serialize(parameters: CommerceSearchParameters): string {
  return coreSerialize(serializePair)(parameters);
}

function deserialize<T extends Parameters>(fragment: string): T {
  const parts = fragment.split(delimiter);
  const keyValuePairs = parts
    .map(splitOnFirstEqual)
    .map(preprocessObjectPairs)
    .filter(isValidPair)
    .map(cast);

  return keyValuePairs.reduce((acc: Partial<T>, pair) => {
    const [key, val] = pair;

    if (keyHasObjectValue(key)) {
      const mergedValues = {...acc[key], ...(val as object)};
      return {...acc, [key]: mergedValues};
    }

    return {...acc, [key]: val};
  }, {}) as T;
}

export function keyHasObjectValue(key: string): key is FacetKey {
  return key in supportedFacetParameters;
}

function isValidPair<K extends keyof Parameters>(
  pair: string[]
): pair is [K, string] {
  const validKey = isValidKey(pair[0]);
  const lengthOfTwo = pair.length === 2;
  return validKey && lengthOfTwo;
}

function cast<K extends keyof Parameters>(pair: [K, string]): [K, unknown] {
  const [key, value] = pair;

  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-907: Handle sort and pagination
  /*if (key === 'page' || key === 'perPage') {
    return [key, parseInt(value)];
  }*/

  if (keyHasObjectValue(key)) {
    return [key, castUnknownObject(value)];
  }

  return [key, decodeURIComponent(value)];
}
