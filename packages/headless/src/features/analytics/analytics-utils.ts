import {Result} from '../../api/search/search/result';
import {
  PartialDocumentInformation,
  DocumentIdentifier,
} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchAppState} from '../../state/search-app-state';
import {getPipelineInitialState} from '../pipeline/pipeline-state';

export const partialDocumentInformation = (
  result: Result,
  state: Partial<SearchAppState>
): PartialDocumentInformation => {
  const resultIndex =
    state.search?.response.results.findIndex(
      ({uniqueId}) => result.uniqueId === uniqueId
    ) || 0;
  return {
    collectionName: result.raw['collection'] || 'default',
    documentAuthor: result.raw['author'] as string,
    documentPosition: resultIndex + 1,
    documentTitle: result.title,
    documentUri: result.uri,
    documentUriHash: result.raw['urihash'],
    documentUrl: result.clickUri,
    rankingModifier: result.rankingModifier || '',
    sourceName: result.raw['source'],
    queryPipeline: state.pipeline || getPipelineInitialState(),
  };
};

export const documentIdentifier = (result: Result): DocumentIdentifier => {
  return {
    contentIDKey: '@permanentid',
    contentIDValue: result.raw.permanentid,
  };
};
