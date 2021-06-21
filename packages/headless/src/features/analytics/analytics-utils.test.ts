import {createMockState} from '../../test';
import {buildMockResult} from '../../test';
import {createMockRecommendationState} from '../../test/mock-recommendation-state';
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

    it('when the result is not found in state, the documentPosition is 0', () => {
      const result = buildMockResult({uniqueId: '1'});
      const state = createMockState();

      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(0);
    });

    it('when the result is found in state, the documentPosition is the index + 1', () => {
      const result = buildMockResult({uniqueId: '1'});
      const state = createMockState();
      state.search.response.results = [result];

      const {documentPosition} = partialDocumentInformation(result, state);
      expect(documentPosition).toBe(1);
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
