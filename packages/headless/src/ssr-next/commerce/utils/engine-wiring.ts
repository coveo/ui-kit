import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import type {CommonBuildConfig} from '../types/build.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

export function assembleEngineConfiguration<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  opts: CommerceEngineDefinitionOptions<TControllerDefinitions>,
  commonBuildOptions?: CommonBuildConfig
): CommerceEngineOptions {
  const {country, currency, language, url, cart, location} =
    commonBuildOptions!;
  const {configuration, ...rest} = opts;
  return {
    configuration: {
      context: {
        view: {url},
        language,
        country,
        location,
        currency,
      },
      cart,
      ...configuration,
    },
    ...rest,
  };
}
