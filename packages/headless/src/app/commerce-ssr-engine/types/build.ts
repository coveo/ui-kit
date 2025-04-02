import {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionBuildResult,
  OptionsExtender,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';
import {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  SolutionType,
} from './common.js';

export interface BuildOptions<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

export type Build<
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = {
  /**
   * Initializes an engine and controllers from the definition.
   */
  (
    ...params: OptionsTuple<
      BuildOptions<TEngineOptions> &
        EngineDefinitionControllersPropsOption<
          TControllersDefinitionsMap,
          TControllersProps,
          TSolutionType
        >
    >
  ): Promise<EngineDefinitionBuildResult<SSRCommerceEngine, TControllersMap>>;
};
