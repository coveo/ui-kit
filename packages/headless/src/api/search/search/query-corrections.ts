/**
 * Describe correction for a query, using the older index based system.
 */
export interface QueryCorrection {
  /**
   * The query once corrected
   */
  correctedQuery: string;
  /**
   * Array of correction for each word in the query
   */
  wordCorrections?: WordCorrection[];
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

/**
 * Describe correction for a query, using the advanced machine learning based system.
 */
export interface Correction {
  /**
   * The original query that was performed, without any automatic correction applied.
   */
  originalQuery: string;
  /**
   * The correction that was applied to the query.
   */
  correctedQuery: string;
  /**
   * Array of correction for each word in the query
   */
  corrections: QueryCorrection[];
}
