import type {
  GeneratedAnswerDraft,
  Message,
  StreamPayload,
} from '../shared-types.js';

export const handleAnswerId = (
  draft: GeneratedAnswerDraft,
  answerId: string
) => {
  if (answerId) {
    draft.answerId = answerId;
  }
};

export const handleHeaderMessage = (
  draft: GeneratedAnswerDraft,
  payload: Pick<GeneratedAnswerDraft, 'contentFormat'>
) => {
  const {contentFormat} = payload;
  draft.contentFormat = contentFormat;
  draft.isStreaming = true;
  draft.isLoading = false;
};

export const handleMessage = (
  draft: GeneratedAnswerDraft,
  payload: Pick<StreamPayload, 'textDelta'>
) => {
  if (draft.answer === undefined) {
    draft.answer = payload.textDelta;
  } else if (typeof payload.textDelta === 'string') {
    draft.answer = draft.answer.concat(payload.textDelta);
  }
};

export const handleCitations = (
  draft: GeneratedAnswerDraft,
  payload: Pick<StreamPayload, 'citations'>
) => {
  draft.citations = payload.citations;
};

export const handleEndOfStream = (
  draft: GeneratedAnswerDraft,
  payload: Pick<StreamPayload, 'answerGenerated'>
) => {
  draft.generated = payload.answerGenerated;
  draft.isStreaming = false;
};

export const handleError = (
  draft: GeneratedAnswerDraft,
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
