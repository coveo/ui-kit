import type {
  QuestionAnswer,
  QuestionsAnswers,
} from '../api/search/search/question-answering.js';

export function buildMockQuestionAnswer(
  config: Partial<QuestionAnswer> = {}
): QuestionAnswer {
  return {
    answerSnippet: '',
    documentId: {
      contentIdKey: '',
      contentIdValue: '',
    },
    question: '',
    score: 0,
    ...config,
  };
}

export function buildMockQuestionsAnswers(
  config: Partial<QuestionsAnswers> = {}
): QuestionsAnswers {
  return {
    ...buildMockQuestionAnswer(),
    relatedQuestions: [],
    ...config,
  };
}
