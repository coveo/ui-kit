import type {SolutionType} from '@coveo/headless/ssr-commerce';
import {capitalize} from './utils.js';

export class MissingEngineProviderError extends Error {
  static message =
    'Unable to find Context. Please make sure you are wrapping your controller with either `StaticStateProvider` or `HydratedStateProvider` controller that can provide the required context.';
  constructor() {
    super(MissingEngineProviderError.message);
  }
}

export class UndefinedControllerError extends Error {
  static createEngineSupportMessage(solutionTypes: SolutionType[]) {
    const supportedEngineDefinitionList = solutionTypes.map(
      (solutionType) => `${solutionType}EngineDefinition`
    );
    return `This controller is only available in these engine definitions:\n${supportedEngineDefinitionList.map((def) => ` • ${def}`).join('\n')}`;
  }

  constructor(controllerName: string, solutionTypes: SolutionType[]) {
    super(
      [
        `You're importing a controller (use${capitalize(controllerName)}) that is not defined in the current engine definition`,
        UndefinedControllerError.createEngineSupportMessage(solutionTypes),
        '',
        'Ensure that the controller is wrapped in the appropriate State Provider.',
        // 'Learn more: TODO: Add link to documentation on how to use hooks with providers',
      ].join('\n')
    );
  }
}
