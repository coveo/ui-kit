import {ApiEntryPoint} from '@microsoft/api-extractor-model';

export function findApi(entry: ApiEntryPoint, apiName: string) {
  const name = extractCanonicalName(apiName);
  const result = entry.members.find((m) =>
    m.canonicalReference
      .toString()
      .startsWith(`${entry.canonicalReference}${name}:`)
  );

  if (!result) {
    throw new Error(`No api found for ${name}`);
  }

  return result;
}

function extractCanonicalName(apiName: string) {
  const dollarIndex = apiName.indexOf('$');
  const nameEndIndex = dollarIndex !== -1 ? dollarIndex : apiName.length;
  return apiName.slice(0, nameEndIndex);
}
