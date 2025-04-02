export interface Raw {
  /**
   * Custom keys that depend on the documents in the index.
   */
  [key: string]: unknown;

  /**
   * @internal
   */
  urihash: string;

  /**
   * @internal
   */
  clickableuri?: string;

  /**
   * @internal
   */
  collection?: string;

  /**
   * @internal
   */
  connectortype?: string;

  /**
   * @internal
   */
  documenttype?: string;

  /**
   * @internal
   */
  date?: number;

  /**
   * @internal
   */
  filetype?: string;

  /**
   * @internal
   */
  language?: string[];

  /**
   * @internal
   */
  objecttype?: string;

  /**
   * @internal
   */
  parents?: string;

  /**
   * @internal
   */
  permanentid?: string;

  /**
   * @internal
   */
  size?: number;

  /**
   * @internal
   */
  source?: string;

  /**
   * @internal
   */
  sourcetype?: string;
}
