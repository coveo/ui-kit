import {
  ApiIndexSignature,
  IApiIndexSignatureOptions,
  ReleaseTag,
} from '@microsoft/api-extractor-model';

export function buildMockApiIndexSignature(
  config: Partial<IApiIndexSignatureOptions> = {}
): ApiIndexSignature {
  return new ApiIndexSignature({
    docComment: undefined,
    excerptTokens: [],
    overloadIndex: 0,
    parameters: [],
    releaseTag: ReleaseTag.None,
    returnTypeTokenRange: {startIndex: 0, endIndex: 0},
    ...config,
  });
}
