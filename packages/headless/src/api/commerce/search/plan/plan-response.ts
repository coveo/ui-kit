export interface CommercePlanSuccessResponse {
  /**
   * The URL to which to redirect the user.
   * (Null if there isn't one.)
   * @example https://www.example.com/
   */
  redirect: string | null;
}
