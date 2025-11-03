import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildContext,
  type Context,
} from '../../../../controllers/context/headless-context.js';
import type {ContextProps} from '../../../../controllers/core/context/headless-core-context.js';
import {MissingControllerProps} from '../../../common/errors.js';
import type {ControllerDefinitionWithProps} from '../../types/controller-definition.js';

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
    // TODO: KIT-5154 - Apply commerce pattern
    buildWithProps: (engine, props) => {
      if (props === undefined) {
        throw new MissingControllerProps('Context');
      }
      return buildContext(engine, {initialState: props.initialState});
    },
  };
}
