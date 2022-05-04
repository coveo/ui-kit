import {generateComponentHTML, TestFixture} from '../fixtures/test-fixture';
import {toArray} from '../utils/arrayUtils';
import {addSmartSnippetDefaultOptions} from './smart-snippet-actions';

export interface AddSmartSnippetSuggestionsOptions {
  remSize?: number;
  props?: {
    'heading-level'?: number;
    'snippet-style'?: string;
  };
  content?: HTMLElement | HTMLElement[];
  relatedQuestions?: {
    question: string;
    answer: string;
    sourceTitle: string;
    sourceUrl: string;
    id: string;
  }[];
}

export const addSmartSnippetSuggestionsDefaultOptions: Required<AddSmartSnippetSuggestionsOptions> =
  {
    remSize: 12,
    props: {},
    content: [],
    relatedQuestions: [
      {
        question: 'Where does the name "Nurse Sharks" come from?',
        answer: `
          <p>
            The name nurse shark is thought to be a corruption of <b>nusse</b>, a name which once referred to the catsharks of the family Scyliorhinidae.
          </p>
          <p>
            The nurse shark family name, <b>Ginglymostomatidae</b>, derives from the Greek words <i>ginglymos</i> (γίγγλυμος) meaning "<b>hinge</b>" and <i>stoma</i> (στόμα) meaning "<b>mouth</b>". 
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
            Breeds of Artemia are sold as novelty gifts under the marketing name Sea-Monkeys. 
          </p>
          <p>
            <b>Artemia</b> is a genus of aquatic crustaceans also known as <b>brine shrimp</b>. Artemia, the only genus in the family <i>Artemiidae</i>.
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
            The <b>Columbellidae</b>, the dove snails or dove shells, are a family of minute to small sea snails, marine gastropod mollusks in the order <i>Neogastropoda</i>.
          </p>
        `,
        sourceTitle: 'Dove Snails',
        sourceUrl: 'https://www.inaturalist.org/taxa/50704',
        id: 'dove-snail',
      },
    ],
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
    const relatedQuestions =
      options.relatedQuestions ??
      addSmartSnippetSuggestionsDefaultOptions.relatedQuestions;
    fixture
      .withStyle(
        `html { font-size: ${
          options.remSize ?? addSmartSnippetSuggestionsDefaultOptions.remSize
        }px; }`
      )
      .withElement(element)
      .withCustomResponse((response) => {
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
      });
  };
