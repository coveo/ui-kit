import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
import {
  QuestionAnsweringSection,
  SearchSection,
} from '../../state/state-sections';
import {resultFromFieldSelector} from '../search/search-selectors';

export function answerSourceSelector(
  state: Partial<SearchSection & QuestionAnsweringSection>,
  documentIdentifier?: QuestionAnswerDocumentIdentifier
) {
  const documentId =
    documentIdentifier ?? state.search?.response?.questionAnswer?.documentId;
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
    state.search?.response?.questionAnswer?.relatedQuestions?.[index];
  return searchQuestionState ?? null;
}
