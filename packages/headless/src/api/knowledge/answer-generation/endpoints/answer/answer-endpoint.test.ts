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
      strategy: {
        handleOpen: vi.fn(),
        handleClose: vi.fn(),
        handleError: vi.fn(),
        handleMessage: {},
      },
      params: {
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
      },
    };
  });

  describe('#initiateAnswerEndpoint', () => {
    it('should call endpoint initiate with provided args', () => {
      const mockInitiate = vi.fn();
      vi.spyOn(
        answerEndpoint.endpoints.generateAnswer,
        'initiate'
      ).mockImplementation(mockInitiate);

      initiateAnswerEndpoint(mockArgs);

      expect(mockInitiate).toHaveBeenCalledWith(mockArgs);
    });
  });
});
