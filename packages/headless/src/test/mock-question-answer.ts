import {
  QuestionAnswer,
  QuestionsAnswers,
} from '../api/search/search/question-answering';

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
    answerSnippet: '',
    documentId: {
      contentIdKey: '',
      contentIdValue: '',
    },
    question: '',
    relatedQuestions: [],
    score: 0,
    ...config,
  };
}
