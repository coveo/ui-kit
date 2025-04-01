export interface CommerceAPIErrorStatusResponse {
  statusCode: number;
  message: string;
  type: string;
  ignored?: boolean;
}

export interface CommerceAPIErrorResponse {
  error: CommerceAPIErrorStatusResponse;
}
