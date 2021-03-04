export interface UserIdentity {
  /**
   * The security identity name.
   */
  name: string;

  /**
   * The security identity provider.
   */
  provider: string;

  /**
   * The security identity type. Possible values are `USER`, `GROUP`, `VIRTUAL_GROUP`, or `UNKNOWN`.
   */
  type: string;
}
