import {GeneratedAnswerStreamRequest} from '../../api/search/generated-answer/generated-answer-request';
import {
  ConfigurationSection,
  GeneratedAnswerSection,
} from '../../state/state-sections';

type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  GeneratedAnswerSection;

export const buildStreamingRequest = async (
  state: StateNeededByGeneratedAnswerStream
): Promise<GeneratedAnswerStreamRequest> => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: state.configuration.search.apiBaseUrl,
  streamKey: state.generatedAnswer.streamKey,
});
