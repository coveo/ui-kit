export type RequestContributor<TRequest extends object> =
  () => Partial<TRequest>;
