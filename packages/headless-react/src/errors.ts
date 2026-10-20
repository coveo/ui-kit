import type {SolutionType} from '@coveo/headless/ssr-commerce';
import {capitalize} from './utils.js';

export class MissingEngineProviderError extends Error {
  static message =
    'Unable to find the engine context. Make sure the component using a controller hook is rendered inside the provider of the engine definition that fetched the static state (the provider built with `buildProviderWithDefinition()`, or a `StateProvider`).';
  constructor() {
    super(MissingEngineProviderError.message);
  }
}

export class UndefinedControllerError extends Error {
  static createEngineSupportMessage(solutionTypes: SolutionType[]) {
    if (solutionTypes.length === 0) {
      return 'This controller is not part of the current engine definition.';
    }
    const supportedEngineDefinitionList = solutionTypes.map(
      (solutionType) => `${solutionType}EngineDefinition`
    );
    return `This controller is only available in these engine definitions:\n${supportedEngineDefinitionList.map((def) => ` • ${def}`).join('\n')}`;
  }

  constructor(controllerName: string, solutionTypes: SolutionType[]) {
    super(
      [
        `You're using a controller hook (use${capitalize(controllerName)}) whose controller is not available in the current engine definition.`,
        UndefinedControllerError.createEngineSupportMessage(solutionTypes),
        '',
        'Ensure that the component using the hook is rendered inside the provider of an engine definition that includes this controller.',
      ].join('\n')
    );
  }
}
