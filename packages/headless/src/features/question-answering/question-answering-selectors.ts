import {
  QuestionAnsweringSection,
  SearchSection,
} from '../../state/state-sections';

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
