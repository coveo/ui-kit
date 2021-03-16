export interface ErrorPayload {
  /**
   * The HTTP status code.
   */
  statusCode: number;

  /**
   * The error message.
   */
  message: string;

  /**
   * The error stack.
   */
  stack?: string;

  /**
   * The error type.
   */
  type: string;
}
