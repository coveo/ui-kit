import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {buildContext, type Context} from '../../../../controllers/context/headless-context.js';
import type {ControllerDefinition} from '../../types/controller-definition.js';

export * from '../../../../controllers/context/headless-context.js';

export interface ContextDefinition extends ControllerDefinition<SearchEngine, Context> {}

/**
 * Defines the `Context` controller that every search engine definition includes. It is fed by the
 * `context` option of `fetchStaticState()`.
 *
 * @internal
 */
export function defineContext(): ContextDefinition {
  return {
    build: (engine, {buildConfig}) =>
      buildContext(engine, {initialState: {values: buildConfig.context ?? {}}}),
  };
}
