import {ApiEntryPoint} from '@microsoft/api-extractor-model';

export function findApi(entry: ApiEntryPoint, apiName: string) {
  const canonicalName = extractCanonicalName(apiName);
  const [result] = entry.findMembersByName(canonicalName);

  if (!result) {
    throw new Error(`No api found for ${canonicalName}`);
  }

  return result;
}

function extractCanonicalName(apiName: string) {
  const dollarIndex = apiName.indexOf('$');
  const endIndex = dollarIndex !== -1 ? dollarIndex : apiName.length;

  return apiName.slice(0, endIndex);
}
