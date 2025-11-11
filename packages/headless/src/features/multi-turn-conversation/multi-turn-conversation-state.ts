import type {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload.js';
import type {GeneratedContentFormat} from '../generated-answer/generated-response-format.js';

export interface ConversationTurn {
  answer: string;
  prompt: string;
  citations: GeneratedAnswerCitation[];
  isStreaming: boolean;
  isLoading: boolean;
  error: string | null;
  cannotAnswer: boolean;
  answerId?: string;
  answerContentFormat: GeneratedContentFormat;
}

export interface MultiTurnConversationState {
  conversationId: string;
  answers: ConversationTurn[];
}

export function getMultiTurnConversationInitialState(): MultiTurnConversationState {
  return {
    conversationId: '',
    answers: [],
  };
}
