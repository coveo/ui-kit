import type {GeneratedContentFormat} from '../../../../features/generated-answer/generated-response-format.js';
import type {GeneratedAnswerCitation} from '../../../generated-answer/generated-answer-event-payload.js';
import type {GeneratedAnswerServerState} from '../answer-generation-api-state.js';
import type {Message} from './strategies/types.js';

export interface StreamPayload {
  textDelta?: string;
  padding?: string;
  answerGenerated?: boolean;
  contentFormat: GeneratedContentFormat;
  citations: GeneratedAnswerCitation[];
}

export const handleAnswerId = (
  draft: GeneratedAnswerServerState,
  answerId: string
) => {
  if (answerId) {
    draft.answerId = answerId;
  }
};

export const handleHeaderMessage = (
  draft: GeneratedAnswerServerState,
  payload: Pick<GeneratedAnswerServerState, 'contentFormat'>
) => {
  const {contentFormat} = payload;
  draft.contentFormat = contentFormat;
  draft.isStreaming = true;
  draft.isLoading = false;
};

export const handleMessage = (
  draft: GeneratedAnswerServerState,
  payload: Pick<StreamPayload, 'textDelta'>
) => {
  if (draft.answer === undefined) {
    draft.answer = payload.textDelta;
  } else if (typeof payload.textDelta === 'string') {
    draft.answer = draft.answer.concat(payload.textDelta);
  }
};

export const handleCitations = (
  draft: GeneratedAnswerServerState,
  payload: Pick<StreamPayload, 'citations'>
) => {
  draft.citations = payload.citations;
};

export const handleEndOfStream = (
  draft: GeneratedAnswerServerState,
  payload: Pick<StreamPayload, 'answerGenerated'>
) => {
  draft.generated = payload.answerGenerated;
  draft.isStreaming = false;
};

export const handleError = (
  draft: GeneratedAnswerServerState,
  message: Required<Message>
) => {
  const errorMessage = message.errorMessage || 'Unknown error occurred';

  draft.error = {
    message: errorMessage,
    code: message.code!,
  };
  draft.isStreaming = false;
  draft.isLoading = false;
  // Throwing an error here breaks the client and prevents the error from reaching the state.
  console.error(
    `Generated answer error: ${errorMessage} (code: ${message.code})`
  );
};
