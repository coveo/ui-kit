import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticState, ControllersMap} from './controllers.js';

export type InferControllerStaticStateFromController<
  TController extends Controller,
> = ControllerStaticState<TController['state']>;

export type InferControllerStaticStateMapFromControllers<
  TControllers extends ControllersMap,
> = {
  [K in keyof TControllers]: InferControllerStaticStateFromController<
    TControllers[K]
  >;
};
