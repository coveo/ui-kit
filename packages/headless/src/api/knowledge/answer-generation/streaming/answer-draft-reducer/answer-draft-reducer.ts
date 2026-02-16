import type {GeneratedAnswerServerState} from '../../answer-generation-api-state.js';
import type {Message, StreamPayload} from '../types.js';

/**
 * Sets the answer ID in the draft state if provided.
 */
export const setAnswerId = (
  draft: GeneratedAnswerServerState,
  answerId: string
) => {
  if (answerId) {
    draft.answerId = answerId;
  }
};

/**
 * Initializes streaming by setting content format and updating streaming flags.
 */
export const initializeStreamingAnswer = (
  draft: GeneratedAnswerServerState,
  payload: Pick<GeneratedAnswerServerState, 'contentFormat'>
) => {
  const {contentFormat} = payload;
  draft.contentFormat = contentFormat;
  draft.isStreaming = true;
  draft.isLoading = false;
};

/**
 * Appends or sets answer text from streaming deltas.
 */
export const setAnswer = (
  draft: GeneratedAnswerServerState,
  payload: Pick<StreamPayload, 'textDelta'>
) => {
  if (draft.answer === undefined) {
    draft.answer = payload.textDelta;
  } else if (typeof payload.textDelta === 'string') {
    draft.answer = draft.answer.concat(payload.textDelta);
  }
};

/**
 * Updates the citations list in the draft state.
 */
export const setCitations = (
  draft: GeneratedAnswerServerState,
  payload: Pick<StreamPayload, 'citations'>
) => {
  draft.citations = payload.citations;
};

/**
 * Finalizes streaming by marking it complete and stopping the stream.
 */
export const endStreaming = (
  draft: GeneratedAnswerServerState,
  payload: Pick<StreamPayload, 'answerGenerated'>
) => {
  draft.generated = payload.answerGenerated;
  draft.isStreaming = false;
};

/**
 * Sets error state and stops streaming when an error occurs.
 */
export const setAnswerError = (
  draft: GeneratedAnswerServerState,
  message: Message
) => {
  const errorMessage = message.errorMessage || 'Unknown error occurred';

  draft.error = {
    message: errorMessage,
    code: message.code ?? 500,
  };
  draft.isStreaming = false;
  draft.isLoading = false;
  // Throwing an error here breaks the client and prevents the error from reaching the state.
  console.error(
    `Generated answer error: ${errorMessage} (code: ${message.code})`
  );
};
