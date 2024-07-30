import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {ControllerDefinitionWithoutProps} from '../../../app/ssr-engine/types/common';
import {Context, buildContext} from './headless-context';

export type {ContextState, Context} from './headless-context';

export interface ContextDefinition
  extends ControllerDefinitionWithoutProps<CommerceEngine, Context> {}

/**
 * Defines a `Context` controller instance.
 *
 * @returns The `Context` controller definition.
 *
 * @internal
 */
export function defineContext(): ContextDefinition {
  return {
    build: (engine) => buildContext(engine),
  };
}
