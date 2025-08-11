import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import type {CommonBuildConfig} from '../types/build.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

export function assembleEngineConfiguration<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  opts: CommerceEngineDefinitionOptions<TControllerDefinitions>,
  _commonBuildOptions?: CommonBuildConfig
): CommerceEngineOptions {
  // TODO: KIT-4742: Implement: wire engine configuration with validation
  return opts as CommerceEngineOptions;
}
