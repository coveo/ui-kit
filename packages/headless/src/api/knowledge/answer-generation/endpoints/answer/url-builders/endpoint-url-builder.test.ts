import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getOrganizationEndpoint} from '../../../../../platform-client.js';
import type {AnswerGenerationApiState} from '../../../answer-generation-api-state.js';
import {buildAnswerEndpointUrl} from './endpoint-url-builder.js';

vi.mock('../../../../../platform-client.js', () => ({
  getOrganizationEndpoint: vi.fn(),
}));

describe('endpoint-url-builder', () => {
  describe('#buildAnswerEndpointUrl', () => {
    let state: AnswerGenerationApiState;
    const mockOrganizationId = 'test-org-id';
    const mockAgentId = 'test-agent-id';
    const mockPlatformEndpoint = 'https://test-org-id.org.coveo.com';

    beforeEach(() => {
      vi.clearAllMocks();

      state = {
        configuration: {
          organizationId: mockOrganizationId,
          environment: 'prod',
          knowledge: {
            answerConfigurationId: '',
            agentId: mockAgentId,
          },
        },
      } as AnswerGenerationApiState;

      vi.mocked(getOrganizationEndpoint).mockReturnValue(mockPlatformEndpoint);
    });

    it('should build the correct endpoint URL with valid state', () => {
      const result = buildAnswerEndpointUrl(state);

      expect(getOrganizationEndpoint).toHaveBeenCalledWith(
        mockOrganizationId,
        'prod'
      );
      expect(result).toBe(
        `${mockPlatformEndpoint}/rest/organizations/${mockOrganizationId}/answer/v1/configs/${mockAgentId}/generate`
      );
    });

    it('should build the correct endpoint URL with dev environment', () => {
      state.configuration.environment = 'dev';
      const devEndpoint = 'https://test-org-id.orgdev.coveo.com';
      vi.mocked(getOrganizationEndpoint).mockReturnValue(devEndpoint);

      const result = buildAnswerEndpointUrl(state);

      expect(getOrganizationEndpoint).toHaveBeenCalledWith(
        mockOrganizationId,
        'dev'
      );
      expect(result).toBe(
        `${devEndpoint}/rest/organizations/${mockOrganizationId}/answer/v1/configs/${mockAgentId}/generate`
      );
    });

    describe('when required parameters are missing', () => {
      it('should throw an error when platformEndpoint is missing', () => {
        vi.mocked(getOrganizationEndpoint).mockReturnValue('');

        expect(() => buildAnswerEndpointUrl(state)).toThrow(
          'Missing required parameters for answer endpoint'
        );
      });

      it('should throw an error when organizationId is missing', () => {
        state.configuration.organizationId = '';

        expect(() => buildAnswerEndpointUrl(state)).toThrow(
          'Missing required parameters for answer endpoint'
        );
      });

      it('should throw an error when agentId is missing', () => {
        state.configuration.knowledge.agentId = undefined;

        expect(() => buildAnswerEndpointUrl(state)).toThrow(
          'Missing required parameters for answer endpoint'
        );
      });

      it('should throw an error when agentId is empty string', () => {
        state.configuration.knowledge.agentId = '';

        expect(() => buildAnswerEndpointUrl(state)).toThrow(
          'Missing required parameters for answer endpoint'
        );
      });
    });
  });
});
