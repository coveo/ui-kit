/**
 * Describe correction for a query
 */
export interface QueryCorrection {
  /**
   * The query once corrected
   */
  correctedQuery: string;
  /**
   * Array of correction for each word in the query
   */
  wordCorrections: WordCorrection[];
}

export interface WordCorrection {
  /**
   * Offset, from the beginning of the query
   */
  offset: number;
  /**
   * Length of the correction
   */
  length: number;
  /**
   * The original word that was corrected
   */
  originalWord: string;
  /**
   * The new corrected word
   */
  correctedWord: string;
}
