import {
  ApiFunction,
  IApiFunctionOptions,
  ReleaseTag,
} from '@microsoft/api-extractor-model';

export function buildMockApiFunction(
  config: Partial<IApiFunctionOptions> = {}
) {
  return new ApiFunction({
    name: '',
    docComment: undefined,
    excerptTokens: [],
    overloadIndex: 0,
    parameters: [],
    releaseTag: ReleaseTag.None,
    returnTypeTokenRange: {startIndex: 0, endIndex: 0},
    typeParameters: [],
    ...config,
  });
}
