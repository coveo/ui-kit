import {AnySearchParams} from './types';

export function compareSearchParams(a: AnySearchParams, b: AnySearchParams) {
  const pairsCompareFn = (pairA: [string, string], pairB: [string, string]) =>
    pairA[0].localeCompare(pairB[0]) || pairA[1].localeCompare(pairB[1]);
  const pairsA = Array.from(a.entries());
  const pairsB = Array.from(b.entries());
  if (pairsA.length !== pairsB.length) {
    return false;
  }
  const sortedPairsA = pairsA.sort(pairsCompareFn);
  const sortedPairsB = pairsB.sort(pairsCompareFn);
  const somePairIsDifferent = sortedPairsA.some((pairA, index) => {
    const pairB = sortedPairsB[index];
    return pairA[0] !== pairB[0] || pairA[1] !== pairB[1];
  });
  return !somePairIsDifferent;
}
