import {GeneratedAnswerStreamRequest} from '../../api/generated-answer/generated-answer-request.js';
import {getOrganizationEndpoint} from '../../api/platform-client.js';
import {
  ConfigurationSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections.js';

type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  SearchSection &
  GeneratedAnswerSection;

export const buildStreamingRequest = async (
  state: StateNeededByGeneratedAnswerStream
): Promise<GeneratedAnswerStreamRequest> => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: getOrganizationEndpoint(
    state.configuration.organizationId,
    state.configuration.environment
  ),
  streamId: state.search.extendedResults?.generativeQuestionAnsweringId,
});
