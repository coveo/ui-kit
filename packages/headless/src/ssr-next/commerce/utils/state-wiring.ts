import type {SolutionType} from '../types/controller-constants.js';
import type {
  CommerceControllerDefinitionsMap,
  FetchStaticStateParameters,
} from '../types/engine.js';

export function wireControllerParams<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  _solutionType: SolutionType,
  _controllerDefinitions: TControllerDefinitions,
  _params: FetchStaticStateParameters<TControllerDefinitions>
): void {
  // TODO: KIT-4742: Implement
}
