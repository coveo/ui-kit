import type {CommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import type {CommonBuildConfig} from '../types/build.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

export function extendEngineConfiguration<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  configuration: CommerceEngineDefinitionOptions<TControllerDefinitions>['configuration'],
  commonBuildOptions: CommonBuildConfig
): CommerceEngineConfiguration {
  const {cart, context} = commonBuildOptions;
  return {
    ...configuration,
    context: {
      ...context,
    },
    cart,
  };
}
