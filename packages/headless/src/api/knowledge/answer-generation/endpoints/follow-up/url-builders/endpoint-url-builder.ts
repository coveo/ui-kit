import {getOrganizationEndpoint} from '../../../../../platform-client.js';
import type {AnswerGenerationApiState} from '../../../answer-generation-api-state.js';

/**
 * Builds the complete URL for the follow up endpoint.
 */
export const buildFollowUpEndpointUrl = (
  state: AnswerGenerationApiState
): string => {
  const {configuration, generatedAnswer} = state;
  const {organizationId, environment} = configuration;
  const platformEndpoint = getOrganizationEndpoint(organizationId, environment);

  if (
    !platformEndpoint ||
    !organizationId ||
    !generatedAnswer.answerConfigurationId
  ) {
    throw new Error('Missing required parameters for follow up endpoint');
  }
  const basePath = `/rest/organizations/${organizationId}/agents`;
  return `${platformEndpoint}${basePath}/${generatedAnswer.answerConfigurationId}/follow-up`;
};
