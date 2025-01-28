import {RelatedQuestionsData} from '../../../../../../playwright/page-object/searchObjectWithSmartSnippet';

const exampleContentIdKey = 'permanentid';
const mockPermanentId = '1234';
const exampleContentIdValue = mockPermanentId;

const exampleRelatedQuestions = [
  {
    question: "What is the name of Gandalf's horse?",
    answerSnippet:
      'Is is Shadowfax, the lord of all horses. <a href="#">Click here to see the magnificent horse.</a>',
    documentId: {
      contentIdKey: exampleContentIdKey,
      contentIdValue: exampleContentIdValue,
    },
  },
  {
    question: 'What is the name of the sword that was broken?',
    answerSnippet: 'It is Narsil, the sword of Elendil.',
    documentId: {
      contentIdKey: exampleContentIdKey,
      contentIdValue: exampleContentIdValue,
    },
  },
];

const smartSnippetSuggestionsData: RelatedQuestionsData = {
  relatedQuestions: exampleRelatedQuestions,
};

export default smartSnippetSuggestionsData;
