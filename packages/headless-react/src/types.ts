import {Controller, CoreEngine} from '@coveo/headless';
import {InferControllerFromDefinition} from '@coveo/headless/dist/definitions/app/ssr-engine/types/common';
import {ControllerDefinitionsMap} from '@coveo/headless/ssr';

export type ControllerHook<TController extends Controller> = () => {
  state: TController['state'];
  methods?: Omit<TController, 'state' | 'subscribe'>;
};

export type InferControllerHooksMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = {
  [K in keyof TControllers as `use${Capitalize<
    K extends string ? K : never
  >}`]: ControllerHook<InferControllerFromDefinition<TControllers[K]>>;
};
