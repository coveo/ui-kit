export class MissingEngineProviderError extends Error {
  static message =
    'Unable to find Context. Please make sure you are wrapping your component with either `StaticStateProvider` or `HydratedStateProvider` component that can provide the required context.';
  constructor() {
    super(MissingEngineProviderError.message);
  }
}
