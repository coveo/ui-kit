export interface QuestionAnswerDocumentIdentifier {
  contentIdKey: string;
  contentIdValue: string;
}
export interface QuestionAnswer {
  question: string;
  answerSnippet: string;
  documentId: QuestionAnswerDocumentIdentifier;
  score: number;
}

export interface QuestionsAnswers extends QuestionAnswer {
  relatedQuestions: QuestionAnswer[];
}
