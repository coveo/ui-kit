export interface Raw {
  /**
   * Custom keys that depend on the documents in the index.
   */
  [key: string]: unknown;

  /**
   * @internal @preapproved
   */
  urihash: string;

  /**
   * @internal @preapproved
   */
  permanentid: string;

  /**
   * @internal @preapproved
   */
  sourcetype: string;
}
