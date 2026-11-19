import type {SearchEngine} from '@coveo/headless';
import {buildResultList, type ResultList, type ResultListProps} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type ResultList,
  type ResultListOptions,
  type ResultListProps,
  type ResultListState,
} from '@coveo/headless';

export interface ResultListDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  ResultList
> {}

/**
 * Defines a `ResultList` controller instance.
 * @group Definers
 *
 * @param props - The configurable `ResultList` properties.
 * @returns The `ResultList` controller definition.
 * */
export function defineResultList(props?: ResultListProps): ResultListDefinition {
  return {
    build: (engine) => buildResultList(engine, props),
  };
}
