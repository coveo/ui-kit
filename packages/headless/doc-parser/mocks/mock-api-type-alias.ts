import {
  ApiTypeAlias,
  IApiTypeAliasOptions,
  ReleaseTag,
} from '@microsoft/api-extractor-model';

export function buildMockApiTypeAlias(
  config: Partial<IApiTypeAliasOptions> = {}
) {
  return new ApiTypeAlias({
    name: '',
    isExported: false,
    docComment: undefined,
    excerptTokens: [],
    releaseTag: ReleaseTag.None,
    typeParameters: [],
    typeTokenRange: {startIndex: 0, endIndex: 0},
    ...config,
  });
}
