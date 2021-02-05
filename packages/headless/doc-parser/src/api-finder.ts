import {ApiEntryPoint} from '@microsoft/api-extractor-model';

export function findApi(entry: ApiEntryPoint, apiName: string) {
  const [result] = entry.findMembersByName(apiName);

  if (!result) {
    throw new Error(`No api found for ${apiName}`);
  }

  return result;
}
