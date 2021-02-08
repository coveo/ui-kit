import {
  ApiInterface,
  IApiInterfaceOptions,
  ReleaseTag,
} from '@microsoft/api-extractor-model';

export function buildMockApiInterface(
  config: Partial<IApiInterfaceOptions> = {}
) {
  return new ApiInterface({
    docComment: undefined,
    excerptTokens: [],
    extendsTokenRanges: [],
    name: 'Pager',
    releaseTag: ReleaseTag.None,
    typeParameters: [],
    members: [],
    ...config,
  });
}
