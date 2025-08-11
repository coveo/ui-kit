import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import type {CommonBuildConfig} from '../types/build.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

// TODO: KIT-4742: Add tests
export function extendEngineOptions<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  opts: CommerceEngineDefinitionOptions<TControllerDefinitions>,
  commonBuildOptions?: CommonBuildConfig
): CommerceEngineOptions {
  const {configuration, ...rest} = opts;
  // TODO: KIT-4742: wire engine configuration with validation
  const {country, currency, language, url, location} = commonBuildOptions!;
  return {
    configuration: {
      ...configuration,
      context: {
        country,
        currency,
        language,
        view: {url},
        location,
      },
    },
    ...rest,
  };
}
