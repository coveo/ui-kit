import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type FollowUpEndpointArgs,
  followUpEndpoint,
  initiateAnswerEndpoint,
} from './follow-up-endpoint.js';

vi.mock('../streaming/answer-streaming-runner.js');

describe('follow-up-endpoint', () => {
  let mockArgs: FollowUpEndpointArgs;

  beforeEach(() => {
    vi.clearAllMocks();

    mockArgs = {
      strategyKey: 'follow-up-answer',
      conversationId: 'test-conversation-id',
      q: 'test query',
      searchHub: 'test-hub',
      pipeline: 'test-pipeline',
      pipelineRuleParameters: {},
    };
  });

  describe('#initiateFollowUpEndpoint', () => {
    it('should call endpoint initiate with provided args', () => {
      const mockInitiate = vi.fn();
      vi.spyOn(
        followUpEndpoint.endpoints.generateAnswer,
        'initiate'
      ).mockImplementation(mockInitiate);

      initiateAnswerEndpoint(mockArgs);

      expect(mockInitiate).toHaveBeenCalledWith(mockArgs);
    });
  });
});
