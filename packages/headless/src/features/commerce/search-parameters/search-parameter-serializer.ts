import {
  delimiter,
  serializeSpecialCharacters,
  splitOnFirstEqual,
} from '../../search-parameters/search-parameter-serializer';
import {serialize as coreSerialize} from '../../search-parameters/search-parameter-serializer';
import {
  CommerceSearchParameters,
  Parameters,
  ProductListingParameters,
} from './search-parameter-actions';

export interface Serializer<T extends Parameters> {
  serialize: (parameters: T) => string;
  deserialize: (fragment: string) => T;
}

export const searchSerializer = {
  serialize,
  deserialize,
} as Serializer<CommerceSearchParameters>;

export const productListingSerializer = {
  serialize: () => '',
  deserialize: () => ({}) as ProductListingParameters,
} as Serializer<ProductListingParameters>;

function serialize(parameters: CommerceSearchParameters): string {
  return coreSerialize(commercePairSerializer)(parameters);
}

function deserialize(fragment: string): CommerceSearchParameters {
  const parts = fragment.split(delimiter);
  const keyValuePairs = parts
    .map(splitOnFirstEqual)
    .filter(isValidPair)
    .map(cast);

  return keyValuePairs.reduce((acc: CommerceSearchParameters, pair) => {
    const [key, val] = pair;

    return {...acc, [key]: val as string};
  }, {});
}

function commercePairSerializer(pair: [string, unknown]) {
  const [key, val] = pair;

  if (key !== 'q') {
    return '';
  }

  return serializeSpecialCharacters(key, val);
}

function isValidPair<K extends keyof CommerceSearchParameters>(
  pair: string[]
): pair is [K, string] {
  const validKey = isValidKey(pair[0]);
  const lengthOfTwo = pair.length === 2;
  return validKey && lengthOfTwo;
}

function isValidKey(key: string): key is keyof CommerceSearchParameters {
  const supportedParameters: Record<
    keyof Required<CommerceSearchParameters>,
    boolean
  > = {
    q: true,
  };

  return key in supportedParameters;
}

function cast<K extends keyof CommerceSearchParameters>(
  pair: [K, string]
): [K, unknown] {
  const [key, value] = pair;

  return [key, decodeURIComponent(value)];
}
