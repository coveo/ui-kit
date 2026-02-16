export interface APIErrorWithStatusCode {
  ok: boolean;
  status: number;
  statusCode: number;
  message: string;
  type: string;
}
