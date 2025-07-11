import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common.js';
import {MissingControllerProps} from '../../utils/errors.js';
import type {ContextProps} from '../core/context/headless-core-context.js';
import {buildContext, type Context} from './headless-context.js';

export * from './headless-context.js';

export interface ContextDefinition
  extends ControllerDefinitionWithProps<SearchEngine, Context, ContextProps> {}

/**
 * Defines a `Context` controller instance.
 * @group Definers
 *
 * @returns The `Context` controller definition.
 * */
export function defineContext(): ContextDefinition {
  return {
    buildWithProps: (engine, props) => {
      if (props === undefined) {
        throw new MissingControllerProps('Context');
      }
      return buildContext(engine, {initialState: props.initialState});
    },
  };
}
