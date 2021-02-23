import {
  ApiMethodSignature,
  IApiMethodSignatureOptions,
  ReleaseTag,
} from '@microsoft/api-extractor-model';

export function buildMockApiMethodSignature(
  config: Partial<IApiMethodSignatureOptions> = {}
) {
  return new ApiMethodSignature({
    docComment: undefined,
    excerptTokens: [],
    isOptional: false,
    name: '',
    releaseTag: ReleaseTag.None,
    overloadIndex: 0,
    parameters: [],
    returnTypeTokenRange: {startIndex: 0, endIndex: 0},
    typeParameters: [],
    ...config,
  });
}
