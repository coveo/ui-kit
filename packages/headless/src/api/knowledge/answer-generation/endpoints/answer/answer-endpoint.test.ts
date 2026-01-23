import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type AnswerEndpointArgs,
  answerEndpoint,
  initiateAnswerEndpoint,
} from './answer-endpoint.js';

vi.mock('../streaming/answer-streaming-runner.js');

describe('answer-endpoint', () => {
  let mockArgs: AnswerEndpointArgs;

  beforeEach(() => {
    vi.clearAllMocks();

    mockArgs = {
      q: 'test query',
      facets: [],
      searchHub: 'test-hub',
      pipeline: 'test-pipeline',
      pipelineRuleParameters: {},
      locale: 'en',
      analytics: {
        clientId: 'test-client-id',
        clientTimestamp: '2026-01-16T00:00:00Z',
        documentReferrer: 'https://example.com',
        originContext: 'test-origin',
      },
    };
  });

  describe('#initiateHeadAnswerGeneration', () => {
    it('should call endpoint initiate with provided params', () => {
      const mockInitiate = vi.fn();
      vi.spyOn(
        headAnswerEndpoint.endpoints.generateHeadAnswer,
        'initiate'
      ).mockImplementation(mockInitiate);

      initiateHeadAnswerGeneration(mockArgs);

      expect(mockInitiate).toHaveBeenCalledWith(mockArgs);
    });
  });
});
