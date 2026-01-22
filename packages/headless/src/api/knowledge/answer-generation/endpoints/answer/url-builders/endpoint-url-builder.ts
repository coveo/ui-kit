import {getOrganizationEndpoint} from '../../../../../platform-client.js';
import type {AnswerGenerationApiState} from '../../../answer-generation-api-state.js';

export const buildAnswerEndpointUrl = (
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
    throw new Error('Missing required parameters for answer endpoint');
  }
  const basePath = `/rest/organizations/${organizationId}/answer/v1/configs`;
  return `${platformEndpoint}${basePath}/${generatedAnswer.answerConfigurationId}/generate`;
};
