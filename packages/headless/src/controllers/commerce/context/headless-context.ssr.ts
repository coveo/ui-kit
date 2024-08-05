import {SharedControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {Context, buildContext} from './headless-context';

export type {ContextState, Context} from './headless-context';

export interface ContextDefinition
  extends SharedControllerDefinitionWithoutProps<Context> {}

/**
 * Defines a `Context` controller instance.
 *
 * @returns The `Context` controller definition.
 *
 * @internal
 */
export function defineContext(): ContextDefinition {
  return {
    listing: true,
    search: true,
    build: (engine) => buildContext(engine),
  };
}
