export interface ExecutionReport {
  /**
   * The total time, in milliseconds, needed to process the query.
   */
  duration: number;

  /**
   * The steps involved in processing the query.
   */
  children: ExecutionStep[];
}

export interface ExecutionStep {
  /**
   * The step name.
   */
  name: string;

  /**
   * The step description.
   */
  description: string;

  /**
   * The time, in milliseconds, spent on the step.
   */
  duration: number;

  /**
   * The values returned by the step.
   */
  result?: Record<string, unknown>;

  /**
   * The sub-steps making up the step.
   */
  children?: ExecutionStep[];

  /**
   * Custom keys for the step, holding additional debugging information.
   */
  [key: string]: unknown;
}
