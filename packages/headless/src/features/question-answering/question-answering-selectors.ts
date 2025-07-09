import type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering.js';
import type {
  QuestionAnsweringSection,
  SearchSection,
} from '../../state/state-sections.js';
import {resultFromFieldSelector} from '../search/search-selectors.js';

export function answerSourceSelector(
  state: Partial<SearchSection & QuestionAnsweringSection>,
  documentIdentifier?: QuestionAnswerDocumentIdentifier
) {
  const documentId =
    documentIdentifier ?? state.search?.questionAnswer?.documentId;
  return (
    documentId &&
    state.search &&
    resultFromFieldSelector(
      state as SearchSection,
      documentId.contentIdKey,
      documentId.contentIdValue
    )
  );
}

export function relatedQuestionSelector(
  state: Partial<SearchSection & QuestionAnsweringSection>,
  questionAnswerId: string
) {
  const index =
    state.questionAnswering?.relatedQuestions.findIndex(
      (relatedQuestion) => relatedQuestion.questionAnswerId === questionAnswerId
    ) ?? -1;
  if (index === -1) {
    return null;
  }
  const searchQuestionState =
    state.search?.questionAnswer?.relatedQuestions?.[index];
  return searchQuestionState ?? null;
}
