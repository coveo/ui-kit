import type {SearchEngine} from '@coveo/headless';
import {buildResultsPerPage, type ResultsPerPage, type ResultsPerPageProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type ResultsPerPage,
  type ResultsPerPageInitialState,
  type ResultsPerPageProps,
  type ResultsPerPageState,
} from '@coveo/headless';

export interface ResultsPerPageDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  ResultsPerPage
> {}

/**
 * Defines a `ResultsPerPage` controller instance.
 * @group Definers
 *
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns The `ResultsPerPage` controller definition.
 * */
export function defineResultsPerPage(props?: ResultsPerPageProps): ResultsPerPageDefinition {
  return {
    build: (engine) => buildResultsPerPage(engine, props),
  };
}
