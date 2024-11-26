import type {
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionBuildResult,
  OptionsExtender,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';
import {
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
  TSolutionType extends SolutionType,
> = TSolutionType extends SolutionType.recommendation
  ? {
      /**
       * Initializes an engine and controllers from the definition.
       */
      (
        controllers: (keyof TControllersMap)[]
      ): Promise<
        EngineDefinitionBuildResult<SSRCommerceEngine, TControllersMap>
      >;
    }
  : {
      /**
       * Initializes an engine and controllers from the definition.
       */
      (
        ...params: OptionsTuple<
          BuildOptions<TEngineOptions> &
            EngineDefinitionControllersPropsOption<TControllersProps>
        >
      ): Promise<
        EngineDefinitionBuildResult<SSRCommerceEngine, TControllersMap>
      >;
    };
