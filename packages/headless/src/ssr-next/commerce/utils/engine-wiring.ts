import type {CommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import type {CommonBuildConfig} from '../types/build.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

export function extendEngineConfiguration<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  _configuration: CommerceEngineDefinitionOptions<TControllerDefinitions>['configuration'],
  _commonBuildOptions: CommonBuildConfig
): CommerceEngineConfiguration {
  // TODO: KIT-4742: Implement: wire engine configuration with validation
  return {} as CommerceEngineConfiguration;
}
