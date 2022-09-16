import {
  generateComponentHTML,
  SearchResponseModifierPredicate,
  TestFixture,
} from '../fixtures/test-fixture';
import {toArray} from '../utils/arrayUtils';
import {addSmartSnippetDefaultOptions} from './smart-snippet-actions';

export interface GetResponseModifierWithSmartSnippetSuggestionsOptions {
  relatedQuestions?: {
    question: string;
    answer: string;
    sourceTitle: string;
    sourceUrl: string;
    id: string;
  }[];
}

export interface AddSmartSnippetSuggestionsOptions
  extends GetResponseModifierWithSmartSnippetSuggestionsOptions {
  remSize?: number;
  props?: {
    'heading-level'?: number;
    'snippet-style'?: string;
  };
  content?: HTMLElement | HTMLElement[];
  timesToIntercept?: number;
}

export const getResponseModifierWithSmartSnippetSuggestionsDefaultOptions: Required<GetResponseModifierWithSmartSnippetSuggestionsOptions> =
  {
    relatedQuestions: [
      {
        question: 'Where does the name "Nurse Sharks" come from?',
        answer: `
      <p>
        The name nurse shark is thought to be a corruption of <b>nusse</b>, a name which once referred to the <a href="https://en.wikipedia.org/wiki/Catshark">catsharks</a> of the family Scyliorhinidae.
      </p>
      <p>
        The nurse shark family name, <b>Ginglymostomatidae</b>, derives from the <a href="https://en.wikipedia.org/wiki/Greek_language">Greek</a> words <i>ginglymos</i> (<a href="https://en.wiktionary.org/wiki/%CE%B3%CE%AF%CE%B3%CE%B3%CE%BB%CF%85%CE%BC%CE%BF%CF%82#Ancient_Greek">γίγγλυμος</a>) meaning "<b>hinge</b>" and <i>stoma</i> (<a href="https://en.wiktionary.org/wiki/%CF%83%CF%84%CF%8C%CE%BC%CE%B1#Ancient_Greek">στόμα</a>) meaning "<b>mouth</b>". 
      </p>
    `,
        sourceTitle: 'Nurse Sharks',
        sourceUrl: 'https://www.inaturalist.org/taxa/49968',
        id: 'nurse-sharks',
      },
      {
        question: 'What are sea monkeys?',
        answer: `
      <p>
        Breeds of Artemia are sold as novelty gifts under the marketing name <a href="https://en.wikipedia.org/wiki/Sea-Monkeys">Sea-Monkeys</a>. 
      </p>
      <p>
        <b>Artemia</b> is a genus of aquatic crustaceans also known as <b>brine shrimp</b>. It is the only genus in the <a href="https://en.wikipedia.org/wiki/Family_(biology)">family</a> <b>Artemiidae</b>.
      </p>
    `,
        sourceTitle: 'Brine Shrimp',
        sourceUrl: 'https://www.inaturalist.org/taxa/86651',
        id: 'brine-shrimp',
      },
      {
        question: 'What is a dove snail?',
        answer: `
      <p>
        The <b>Columbellidae</b>, the dove snails or dove shells, are a <a href="https://en.wikipedia.org/wiki/Family_(biology)">family</a> of minute to small <a href="https://en.wikipedia.org/wiki/Sea_snail">sea snails</a>, <a href="https://en.wikipedia.org/wiki/Marine_(ocean)">marine</a> <a href="https://en.wikipedia.org/wiki/Gastropod">gastropod</a> <a href="https://en.wikipedia.org/wiki/Mollusk">mollusks</a> in the order <a href="https://en.wikipedia.org/wiki/Neogastropoda">Neogastropoda</a>.
      </p>
    `,
        sourceTitle: 'Dove Snails',
        sourceUrl: 'https://www.inaturalist.org/taxa/50704',
        id: 'dove-snail',
      },
    ],
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
  options: GetResponseModifierWithSmartSnippetSuggestionsOptions
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
  }));
  response.questionAnswer = {
    documentId: {
      contentIdKey: 'permanentid',
      contentIdValue: firstResult.raw.permanentid!,
    },
    question: addSmartSnippetDefaultOptions.question,
    answerSnippet: addSmartSnippetDefaultOptions.answer,
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
