import {GeneratedAnswerStreamRequest} from '../../api/generated-answer/generated-answer-request';
import {
  ConfigurationSection,
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../state/state-sections';

export type StateNeededByGeneratedAnswerStream = ConfigurationSection &
  Partial<SearchSection & GeneratedAnswerSection & DebugSection>;

export const buildStreamingRequest = async (
  state: StateNeededByGeneratedAnswerStream,
  streamId: string
): Promise<GeneratedAnswerStreamRequest> => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: state.configuration.platformUrl,
  streamId,
});
