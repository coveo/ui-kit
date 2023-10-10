import {removeDuplicates} from '../../utils/utils';
import {ResultWithFolding} from './folding-slice';

export function getAllIncludedResultsFrom(relevantResult: ResultWithFolding) {
  const foldedResults = getChildResultsRecursively(relevantResult);

  const parentResults = [relevantResult, ...foldedResults]
    .filter((result) => result.parentResult)
    .map((result) => result.parentResult!);

  const uniqueFoldedResults = removeDuplicates(
    [...foldedResults, ...parentResults],
    (result) => result.uniqueId
  );

  const includedResults = [
    {...relevantResult, parentResult: null},
    ...uniqueFoldedResults.filter(
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
