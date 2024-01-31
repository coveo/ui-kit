import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithProps} from '../../app/ssr-engine/types/common';
import {ContextProps} from '../core/context/headless-core-context';
import {Context, buildContext} from './headless-context';

export * from './headless-context';

/**
 * Defines a `Context` controller instance.
 *
 * @returns The `Context` controller definition.
 * */
export function defineContext(): ControllerDefinitionWithProps<
  SearchEngine,
  Context,
  ContextProps
> {
  return {
    buildWithProps: (engine, props) =>
      buildContext(engine, {initialState: props.initialState}),
  };
}
