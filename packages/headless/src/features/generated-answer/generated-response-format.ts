export const generatedAnswerStyle = [
  'default',
  'bullet',
  'step',
  'concise',
] as const;

export type GeneratedAnswerStyle = (typeof generatedAnswerStyle)[number];

export interface GeneratedResponseFormat {
  /**
   * The requested formatting style of the generated answer.
   * Options:
   *   - `default`: Generates the answer without additional formatting instructions.
   *   - `bullet`: Requests the answer to be generated in bullet-points.
   *   - `step`: Requests the answer to be generated in step-by-step instructions.
   *   - `concise`: Requests the answer to be generated as concisely as possible.
   */
  answerStyle: GeneratedAnswerStyle;
}
