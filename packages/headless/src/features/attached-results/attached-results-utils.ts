import {isString} from '@coveo/bueno';
import type {Result} from '../../api/search/search/result.js';
import type {AttachedResult} from './attached-results-state.js';

const ensureStringOrUndefined = (
  result: Result,
  key: string
): string | undefined =>
  isString(result.raw[key]) ? String(result.raw[key]) : undefined;

/**
 * Used to build the required data of an AttachedResult from a Search Result.
 * @param result A search api result.
 * @param caseId The current caseId
 * @returns A transformed result to the AttachedResult format
 */
export const buildAttachedResultFromSearchResult = (
  result: Result,
  caseId: string
): AttachedResult => {
  return {
    articleLanguage: ensureStringOrUndefined(result, 'sflanguage'),
    articleVersionNumber: ensureStringOrUndefined(result, 'sflanguage'),
    articlePublishStatus: ensureStringOrUndefined(
      result,
      'articlePublishStatus'
    ),
    caseId: caseId,
    knowledgeArticleId: ensureStringOrUndefined(result, 'knowledgeArticleId'),
    permanentId: result.raw?.permanentid,
    uriHash: result.raw?.urihash,
    resultUrl: result.clickUri,
    source: result.raw.source,
    title: result.title,
  };
};
