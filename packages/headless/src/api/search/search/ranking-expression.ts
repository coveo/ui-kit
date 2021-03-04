export interface RankingExpression {
  /**
   * The query ranking expression (QRE).
   */
  expression: string;

  /**
   * The change to the ranking score applied by the query ranking expression (QRE).
   */
  modifier: string;
}
