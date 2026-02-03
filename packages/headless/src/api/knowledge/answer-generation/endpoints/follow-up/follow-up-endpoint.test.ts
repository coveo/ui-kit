import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type FollowUpEndpointArgs,
  followUpEndpoint,
  initiateFollowUpEndpoint,
} from './follow-up-endpoint.js';

describe('follow-up-endpoint', () => {
  let mockArgs: FollowUpEndpointArgs;

  beforeEach(() => {
    vi.clearAllMocks();

    mockArgs = {
      strategyKey: 'follow-up-answer',
      conversationId: 'test-conversation-id',
      q: 'test query',
    };
  });

  describe('#initiateFollowUpEndpoint', () => {
    it('should call endpoint initiate with provided args', () => {
      const mockInitiate = vi.fn();
      vi.spyOn(
        followUpEndpoint.endpoints.generateFollowUpAnswer,
        'initiate'
      ).mockImplementation(mockInitiate);

      initiateFollowUpEndpoint(mockArgs);
      expect(mockInitiate).toHaveBeenCalledWith(mockArgs);
    });
  });
});
