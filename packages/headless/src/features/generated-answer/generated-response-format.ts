export const generatedAnswerStyle = [
  'default',
  'bullet',
  'step',
  'concise',
] as const;

export const generatedContentFormat = ['text/plain', 'text/markdown'] as const;

export type GeneratedAnswerStyle = (typeof generatedAnswerStyle)[number];

export type GeneratedContentFormat = (typeof generatedContentFormat)[number];

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
  /**
   * The content formats that are supported for rendering the answer. If no values are provided,
   * Formats:
   *   - `text/plain`: The answer can be streamed as plain text.
   *   - `text/markdown`: The answer can be streamed as a Markdown document.
   */
  contentFormat?: GeneratedContentFormat[];
}
