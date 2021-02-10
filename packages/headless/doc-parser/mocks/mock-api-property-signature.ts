import {
  ApiPropertySignature,
  IApiPropertySignatureOptions,
  ReleaseTag,
} from '@microsoft/api-extractor-model';

export function buildMockApiPropertySignature(
  config: Partial<IApiPropertySignatureOptions> = {}
) {
  return new ApiPropertySignature({
    docComment: undefined,
    excerptTokens: [],
    isOptional: false,
    name: '',
    propertyTypeTokenRange: {startIndex: 0, endIndex: 0},
    releaseTag: ReleaseTag.None,
    ...config,
  });
}
