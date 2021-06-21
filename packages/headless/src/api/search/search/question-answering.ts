/**
 * The identifier of a document used to create the smart snippet.
 */
export interface QuestionAnswerDocumentIdentifier {
  /**
   * The content identifier key. Typically, `permanentid` or `urihash`.
   */
  contentIdKey: string;
  /**
   * The content identifier value.
   */
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
