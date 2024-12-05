import {capitalize} from './utils.js';

export class MissingEngineProviderError extends Error {
  static message =
    'Unable to find Context. Please make sure you are wrapping your component with either `StaticStateProvider` or `HydratedStateProvider` component that can provide the required context.';
  constructor() {
    super(MissingEngineProviderError.message);
  }
}

export class UndefinedControllerError extends Error {
  constructor(controllerName: string, solutionType: string) {
    super(
      [
        `You're importing a component (use${capitalize(controllerName)}) that is not defined in the current "${solutionType}EngineDefinition" context.`,
        'Ensure that the component is wrapped in the appropriate State Provider.',
        // 'Learn more: TODO: Add link to documentation on how to use hooks with providers',
      ].join('\n')
    );
  }
}
