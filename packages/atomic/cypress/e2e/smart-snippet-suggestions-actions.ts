import {SearchResponseModifierPredicate} from '../fixtures/fixture-common';
import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {toArray} from '../utils/arrayUtils';
import {
  addSmartSnippetDefaultOptions,
  AddSmartSnippetMockSnippet,
  defaultSnippets,
} from './smart-snippet-actions';

export interface AddSmartSnippetSuggestionsMockRelatedQuestions {
  relatedQuestions?: AddSmartSnippetMockSnippet[];
}

export interface AddSmartSnippetSuggestionsOptions
  extends AddSmartSnippetSuggestionsMockRelatedQuestions {
  remSize?: number;
  props?: {
    'heading-level'?: number;
    'snippet-style'?: string;
  };
  content?: HTMLElement | HTMLElement[];
  timesToIntercept?: number;
}

export const getResponseModifierWithSmartSnippetSuggestionsDefaultOptions: Required<AddSmartSnippetSuggestionsMockRelatedQuestions> =
  {
    relatedQuestions: defaultSnippets,
  };

export const addSmartSnippetSuggestionsDefaultOptions: Required<AddSmartSnippetSuggestionsOptions> =
  {
    ...getResponseModifierWithSmartSnippetSuggestionsDefaultOptions,
    remSize: 12,
    props: {},
    content: [],
    timesToIntercept: 9999,
  };

export const getResponseModifierWithSmartSnippetSuggestions: (
  options: AddSmartSnippetSuggestionsMockRelatedQuestions
) => SearchResponseModifierPredicate = (options) => (response) => {
  const relatedQuestions =
    options.relatedQuestions ??
    addSmartSnippetSuggestionsDefaultOptions.relatedQuestions;
  const [firstResult] = response.results;
  response.results = relatedQuestions.map((relatedQuestion) => ({
    ...firstResult,
    title: relatedQuestion.sourceTitle,
    clickUri: relatedQuestion.sourceUrl,
    raw: {
      ...firstResult.raw,
      permanentid: relatedQuestion.id,
    },
    uniqueId: JSON.stringify(relatedQuestion),
  }));
  response.questionAnswer = {
    documentId: {
      contentIdKey: 'permanentid',
      contentIdValue: firstResult.raw.permanentid!,
    },
    question: addSmartSnippetDefaultOptions.snippet.question,
    answerSnippet: addSmartSnippetDefaultOptions.snippet.answer,
    relatedQuestions: relatedQuestions.map((relatedQuestion, i) => ({
      documentId: {
        contentIdKey: 'permanentid',
        contentIdValue: relatedQuestion.id,
      },
      question: relatedQuestion.question,
      answerSnippet: relatedQuestion.answer,
      score: (relatedQuestions.length - i) * 100,
    })),
    score: 1337,
  };
};

export const addSmartSnippetSuggestions =
  (options: AddSmartSnippetSuggestionsOptions = {}) =>
  (fixture: TestFixture) => {
    const element = generateComponentHTML(
      'atomic-smart-snippet-suggestions',
      options.props ?? addSmartSnippetSuggestionsDefaultOptions.props
    );
    element.append(
      ...toArray(
        options.content ?? addSmartSnippetSuggestionsDefaultOptions.content
      )
    );
    fixture
      .withStyle(
        `html { font-size: ${
          options.remSize ?? addSmartSnippetSuggestionsDefaultOptions.remSize
        }px; }`
      )
      .withElement(element)
      .withCustomResponse(
        getResponseModifierWithSmartSnippetSuggestions(options),
        options.timesToIntercept
      );
  };
