import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {BuildConfig} from '../types/build.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

export function wireControllerParams<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  _solutionType: SolutionType,
  _controllerDefinitions: TControllerDefinitions,
  _paramsObject: BuildConfig<SolutionType> & {
    controllers?: ControllersPropsMap;
  }
): InferControllerPropsMapFromDefinitions<TControllerDefinitions> {
  // TODO: KIT-4742: Implement
  return {} as InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
}
