import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildContext,
  type Context,
} from '../../../../controllers/context/headless-context.js';
import type {ContextProps} from '../../../../controllers/core/context/headless-core-context.js';
import {MissingControllerProps} from '../../../commerce/errors.js';
import type {ControllerDefinitionWithProps} from '../../../common/types/common.js';

export * from '../../../../controllers/context/headless-context.js';

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
