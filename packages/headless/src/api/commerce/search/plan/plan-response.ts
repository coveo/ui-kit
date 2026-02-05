export interface CommercePlanSuccessResponse {
  /**
   * The URL to redirect the user to.
   * (Null if there isn't one.)
   * @example https://www.example.com/
   */
  redirect: string | null;
}
