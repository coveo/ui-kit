import {getOrganizationEndpoint} from '../../../../../platform-client.js';
import type {AnswerGenerationApiState} from '../../../answer-generation-api-state.js';

/**
 * Builds the complete URL for the answer generation endpoint.
 */
export const buildAnswerEndpointUrl = (
  state: AnswerGenerationApiState
): string => {
  const {configuration} = state;
  const {
    organizationId,
    environment,
    knowledge: {agentId},
  } = configuration;
  const platformEndpoint = getOrganizationEndpoint(organizationId, environment);

  const trimmedAgentId = agentId?.trim();
  if (!platformEndpoint || !organizationId || !trimmedAgentId) {
    throw new Error('Missing required parameters for answer endpoint');
  }
  const basePath = `/api/preview/organizations/${organizationId}/agents`;
  return `${platformEndpoint}${basePath}/${trimmedAgentId}/answer`;
};
