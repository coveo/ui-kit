import {removeDuplicates} from '../../utils/utils';
import {ResultWithFolding} from './folding-slice';

export function getAllIncludedResultsFrom(relevantResult: ResultWithFolding) {
  const foldedResults = getChildResultsRecursively(relevantResult);

  const parentResults = [relevantResult, ...foldedResults]
    .filter((result) => result.parentResult)
    .map((result) => result.parentResult!);

  const resultsInCollection = removeDuplicates(
    [...foldedResults, ...parentResults],
    (result) => result.uniqueId
  );

  const includedResults = [
    {...relevantResult, parentResult: null},
    ...resultsInCollection.filter(
      (r) => r.uniqueId !== relevantResult.uniqueId
    ),
  ];

  return includedResults;
}

function getChildResultsRecursively(
  result: ResultWithFolding
): ResultWithFolding[] {
  if (!result.childResults) {
    return [];
  }
  return result.childResults.flatMap((childResult) => [
    childResult,
    ...getChildResultsRecursively(childResult),
  ]);
}
