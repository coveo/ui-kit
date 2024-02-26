import {ApiEntryPoint} from '@microsoft/api-extractor-model';

export function findApi(entry: ApiEntryPoint, apiName: string) {
  const canonicalName = extractCanonicalName(removeTypeTemplate(apiName));
  const [result] = entry.findMembersByName(canonicalName);

  if (!result) {
    const currentUseCaseName: string = process.env['currentUseCaseName']!;
    throw new Error(
      `No api found for ${canonicalName} while processing ${currentUseCaseName}. Ensure ${canonicalName} is exported in the entrypoint of ${currentUseCaseName}.`
    );
  }

  return result;
}

function extractCanonicalName(apiName: string) {
  const dollarIndex = apiName.indexOf('$');
  const endIndex = dollarIndex !== -1 ? dollarIndex : apiName.length;

  return apiName.slice(0, endIndex).trim();
}

const removeTypeTemplate = (input: string): string => {
  // Regular expression to match the templatable type
  const regex = /^(.+)<.*>$/;
  const match = input.match(regex);

  return match ? match[1] : input;
};
