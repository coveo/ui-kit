import {createMockState} from '../../test';
import {buildMockResult} from '../../test';
import {createMockRecommendationState} from '../../test/mock-recommendation-state';
import {buildMockResultWithFolding} from '../../test/mock-result-with-folding';
import {
  partialDocumentInformation,
  partialRecommendationInformation,
} from './analytics-utils';

describe('analytics-utils', () => {
  describe('#partialDocumentInformation', () => {
    it('should extract documentation information with a single author', () => {
      const result = buildMockResult();
      result.raw['author'] = 'john';

      expect(
        partialDocumentInformation(result, createMockState()).documentAuthor
      ).toBe('john');
    });

    it('should extract documentation information with multiple author', () => {
      const result = buildMockResult();
      result.raw['author'] = ['john', 'doe'];

      expect(
        partialDocumentInformation(result, createMockState()).documentAuthor
      ).toBe('john;doe');
    });

    it('should extract document information when there is no author', () => {
      const result = buildMockResult();
      delete result.raw['author'];
      expect(
        partialDocumentInformation(result, createMockState()).documentAuthor
      ).toBe('unknown');
    });

    it('should extract sourceName information from source field', () => {
      const result = buildMockResult();
      result.raw.source = 'mysource';
      expect(
        partialDocumentInformation(result, createMockState()).sourceName
      ).toBe('mysource');
    });

    it('should extract sourceName information when there is no source field', () => {
      const result = buildMockResult();
      delete result.raw['source'];
      expect(
        partialDocumentInformation(result, createMockState()).sourceName
      ).toBe('unknown');
    });

    it('when the result is not found in state, the documentPosition is 1', () => {
      const result = buildMockResult({uniqueId: '1'});
      const state = createMockState();

      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(1);
    });

    it('when the result is found in state, the documentPosition is the index + 1', () => {
      const result = buildMockResult({uniqueId: '1'});
      const state = createMockState();
      state.search.results = state.search.response.results = [result];

      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(1);
    });

    it('when the result is on a different page, the documentPosition is incremented', () => {
      const result = buildMockResult({uniqueId: '1'});
      const state = createMockState();
      state.search.results = state.search.response.results = [result];
      state.pagination.firstResult = 15;

      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(16);
    });

    it('when the result was fetched by fetchMoreResults, the documentPosition is incremented', () => {
      const oldResult = buildMockResult({uniqueId: '1'});
      const newResult = buildMockResult({uniqueId: '2'});
      const state = createMockState();
      state.search.response.results = [newResult];
      state.search.results = [oldResult, newResult];

      const {documentPosition} = partialDocumentInformation(newResult, state);
      expect(documentPosition).toBe(2);
    });

    it('when the result is found in child result, is uses the parent result position', () => {
      const result = buildMockResult({uniqueId: '1'});

      const parentResults = [
        buildMockResultWithFolding(),
        buildMockResultWithFolding(),
        buildMockResultWithFolding(),
      ];
      parentResults[1].childResults = [
        buildMockResultWithFolding(),
        buildMockResultWithFolding(),
      ];
      parentResults[2].childResults = [
        buildMockResultWithFolding(),
        buildMockResultWithFolding(),
        buildMockResultWithFolding({uniqueId: '1'}),
      ];
      const state = createMockState();
      state.search.results = state.search.response.results = parentResults;
      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(3);
    });
  });

  describe('#partialRecommendationInformation', () => {
    it('when the recommendation is not found in state, the documentPosition is 0', () => {
      const recommendation = buildMockResult({uniqueId: '1'});
      const state = createMockRecommendationState();

      const {documentPosition} = partialRecommendationInformation(
        recommendation,
        state
      );
      expect(documentPosition).toBe(0);
    });

    it('when the recommendation is found in state, the documentPosition is the index + 1', () => {
      const recommendation = buildMockResult({uniqueId: '1'});
      const state = createMockRecommendationState();
      state.recommendation.recommendations = [recommendation];

      const {documentPosition} = partialRecommendationInformation(
        recommendation,
        state
      );
      expect(documentPosition).toBe(1);
    });
  });
});
