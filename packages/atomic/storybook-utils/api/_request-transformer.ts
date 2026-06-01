export type RequestTransformer<TResponse> = (
  body: unknown,
  response: TResponse
) => TResponse;
