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
  clickableuri?: string;

  /**
   * @internal @preapproved
   */
  collection?: string;

  /**
   * @internal @preapproved
   */
  connectortype?: string;

  /**
   * @internal @preapproved
   */
  documenttype?: string;

  /**
   * @internal @preapproved
   */
  date?: number;

  /**
   * @internal @preapproved
   */
  filetype?: string;

  /**
   * @internal @preapproved
   */
  language?: string[];

  /**
   * @internal @preapproved
   */
  objecttype?: string;

  /**
   * @internal @preapproved
   */
  parents?: string;

  /**
   * @internal @preapproved
   */
  permanentid?: string;

  /**
   * @internal @preapproved
   */
  size?: number;

  /**
   * @internal @preapproved
   */
  source?: string;

  /**
   * @internal @preapproved
   */
  sourcetype?: string;
}
