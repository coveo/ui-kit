const exampleQuestion = 'Where was Gondor when the Westfold fell?';
const exampleAnswerSnippet = 'Gondor was on the brink of destruction when the Westfold fell.';
const exampleScore = 0.42;
const exampleContentIdKey = 'contentId';
const exampleContentIdValue = '123';

export type QuestionAnswerData = {
  answerFound: boolean;
  question: string;
  answerSnippet: string;
  documentId: {
    contentIdKey: string;
    contentIdValue: string;
  };
  score: number;
};

const smartSnippetData: QuestionAnswerData = {
  answerFound: true,
  question: exampleQuestion,
  answerSnippet: exampleAnswerSnippet,
  documentId: {
    contentIdKey: exampleContentIdKey,
    contentIdValue: exampleContentIdValue,
  },
  score: exampleScore,
};

export default smartSnippetData;