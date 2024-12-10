import type {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionBuildResult,
  OptionsExtender,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';
import {EngineDefinitionControllersPropsOption} from './common.js';

export interface BuildOptions<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

export type Build<
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
> = {
  /**
   * Initializes an engine and controllers from the definition.
   */
  (
    ...params: OptionsTuple<
      BuildOptions<TEngineOptions> &
        EngineDefinitionControllersPropsOption<TControllersProps>
    >
  ): Promise<EngineDefinitionBuildResult<SSRCommerceEngine, TControllersMap>>;
};
