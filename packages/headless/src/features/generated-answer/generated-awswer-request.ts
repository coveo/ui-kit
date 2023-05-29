import {GeneratedAnswerStreamRequest} from '../../api/generated-answer/generated-answer-request';
import {
  ConfigurationSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections';

type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  SearchSection &
  GeneratedAnswerSection;

export const buildStreamingRequest = async (
  state: StateNeededByGeneratedAnswerStream
): Promise<GeneratedAnswerStreamRequest> => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: state.configuration.search.apiBaseUrl,
  streamKey: state.search.extendedResults?.streamKey,
});
