export interface QuestionAnswer {
  question: string;
  answerSnippet: string;
  documentId: {
    contentIdKey: string;
    contentIdValue: string;
  };
  score: number;
}

export interface QuestionsAndAnswers extends QuestionAnswer {
  relatedQuestions: QuestionAnswer[];
}
