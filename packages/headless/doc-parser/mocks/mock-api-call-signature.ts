import {
  ApiCallSignature,
  IApiCallSignatureOptions,
  ReleaseTag,
} from '@microsoft/api-extractor-model';

export function buildMockApiCallSignature(
  config: Partial<IApiCallSignatureOptions> = {}
) {
  return new ApiCallSignature({
    docComment: undefined,
    excerptTokens: [],
    releaseTag: ReleaseTag.None,
    overloadIndex: 0,
    parameters: [],
    returnTypeTokenRange: {startIndex: 0, endIndex: 0},
    typeParameters: [],
    ...config,
  });
}
