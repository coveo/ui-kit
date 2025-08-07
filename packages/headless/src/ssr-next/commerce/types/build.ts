import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllersMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {
  OptionsExtender,
  OptionsTuple,
} from '../../common/types/utilities.js';
import type {SolutionType} from './controller-constants.js';
import type {
  CommerceEngineDefinitionBuildResult,
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
} from './controller-definitions.js';

interface BuildOptions<TEngineOptions> {
  extend?: OptionsExtender<TEngineOptions>;
}

/**
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
) => Promise<CommerceEngineDefinitionBuildResult<TControllersMap>>;
