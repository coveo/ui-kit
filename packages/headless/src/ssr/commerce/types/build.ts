import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {
  OptionsExtender,
  OptionsTuple,
} from '../../common/types/utilities.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionBuildResult,
  EngineDefinitionControllersPropsOption,
} from './controller-definitions.js';

/**
 * @deprecated This type should not be used directly. This interface will be removed in the next major release
 */
export interface BuildOptions<TEngineOptions> {
  /**
   * @deprecated This option will be removed in the next major version.
   */
  extend?: OptionsExtender<TEngineOptions>;
}

/**
 * This type should not be used directly.
 * @internal
 */
export type Build<
  TEngineOptions,
  TControllersMap extends ControllersMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  ...params: OptionsTuple<
    BuildOptions<TEngineOptions> &
      EngineDefinitionControllersPropsOption<
        TControllersDefinitionsMap,
        TControllersProps,
        TSolutionType
      >
  >
) => Promise<EngineDefinitionBuildResult<SSRCommerceEngine, TControllersMap>>;
