// Re-export all components from their individual files for backwards compatibility

export {
  type AnswerAndSourceWrapperProps as SmartSnippetSuggestionsAnswerAndSourceWrapperProps,
  renderAnswerAndSourceWrapper as renderSmartSnippetSuggestionsAnswerAndSourceWrapper,
} from './answer-and-source-wrapper';
export {
  type FooterProps as SmartSnippetSuggestionsFooterProps,
  renderFooter as renderSmartSnippetSuggestionsFooter,
} from './footer';
export {getQuestionPart} from './get-question-part';
export {
  type QuestionProps as SmartSnippetSuggestionsQuestionProps,
  renderQuestion as renderSmartSnippetSuggestionsQuestion,
} from './question';
export {
  type QuestionWrapperProps as SmartSnippetSuggestionsQuestionWrapperProps,
  renderQuestionWrapper as renderSmartSnippetSuggestionsQuestionWrapper,
} from './question-wrapper';
export {
  renderSuggestionsWrapper as renderSmartSnippetSuggestionsWrapper,
  type SuggestionsWrapperProps as SmartSnippetSuggestionsWrapperProps,
} from './suggestions-wrapper';
