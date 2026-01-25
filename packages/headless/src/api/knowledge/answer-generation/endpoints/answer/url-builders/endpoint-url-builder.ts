import {getOrganizationEndpoint} from '../../../../../platform-client.js';
import type {AnswerGenerationApiState} from '../../../answer-generation-api-state.js';

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

  if (!platformEndpoint || !organizationId || !agentId) {
    throw new Error('Missing required parameters for answer endpoint');
  }
  const basePath = `/rest/organizations/${organizationId}/answer/v1/configs`;
  return `${platformEndpoint}${basePath}/${agentId}/generate`;
};
