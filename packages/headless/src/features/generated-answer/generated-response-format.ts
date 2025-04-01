export const generatedContentFormat = ['text/plain', 'text/markdown'] as const;

export type GeneratedContentFormat = (typeof generatedContentFormat)[number];

export interface GeneratedResponseFormat {
  /**
   * The content formats that are supported for rendering the answer. If no values are provided, `text/plain` is used.
   * Formats:
   *   - `text/plain`: The answer can be streamed as plain text.
   *   - `text/markdown`: The answer can be streamed as a Markdown document.
   */
  contentFormat?: GeneratedContentFormat[];
}
