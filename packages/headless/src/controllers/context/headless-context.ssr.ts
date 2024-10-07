import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common.js';
import {ContextProps} from '../core/context/headless-core-context.js';
import {Context, buildContext} from './headless-context.js';

export * from './headless-context.js';

export interface ContextDefinition
  extends ControllerDefinitionWithProps<SearchEngine, Context, ContextProps> {}

/**
 * Defines a `Context` controller instance.
 *
 * @returns The `Context` controller definition.
 * */
export function defineContext(): ContextDefinition {
  return {
    buildWithProps: (engine, props) =>
      buildContext(engine, {initialState: props.initialState}),
  };
}
