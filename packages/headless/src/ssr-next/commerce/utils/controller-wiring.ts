/**
 * Controller Wiring Utilities
 *
 * Transforms simple user configuration into complex internal controller structures.
 */

import {Schema} from '@coveo/bueno';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {BuildConfig, SearchBuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

export const requiredDefinition = {
  language: contextDefinition.language,
  country: contextDefinition.country,
  currency: contextDefinition.currency,
  url: requiredNonEmptyString,
};

export const listingDefinition = {
  ...requiredDefinition,
};

export const searchDefinition = {
  ...requiredDefinition,
  query: requiredEmptyAllowedString,
};

export const recommendationsDefinition = {
  ...requiredDefinition,
  // recommendation:  // TODO: KIT-4619: support array of recommendations
};

export const listingDefinitionSchema = new Schema(listingDefinition);
export const searchDefinitionSchema = new Schema(searchDefinition);
export const recommendationsDefinitionSchema = new Schema(
  recommendationsDefinition
);

/**
 * Validates the build configuration based on the solution type.
 */
function validateBuildConfig(
  solutionType: SolutionType,
  buildConfig: BuildConfig<SolutionType>
): void {
  const validationMap = {
    [SolutionType.listing]: listingDefinitionSchema,
    [SolutionType.search]: searchDefinitionSchema,
    [SolutionType.recommendation]: recommendationsDefinitionSchema,
  } as const;

  const schema = validationMap[solutionType as keyof typeof validationMap];
  schema?.validate(buildConfig);
}

/**
 * Creates a controller property wirer with access to build config and controller props.
 *
 * The wirer contains methods that transform simple configuration values into the specific
 * property structures each controller expects. For example, it converts basic URL/language
 * values into the nested context controller state format.
 */
function createControllerWirer(
  buildConfig: BuildConfig<SolutionType>,
  controllerDefinitions: CommerceControllerDefinitionsMap,
  controllerProps: ControllersPropsMap
) {
  return {
    wireParameterManager: (query?: string) => {
      if (!controllerDefinitions?.parameterManager) return;

      const {searchParams} = buildConfig;
      const parameters = {
        ...(query && {q: query}),
        ...(searchParams && typeof searchParams === 'object'
          ? searchParams
          : {}),
      };

      controllerProps.parameterManager = {
        initialState: {parameters},
      };
    },

    wireContext: () => {
      if (!controllerDefinitions?.context) return;

      const {language, country, currency, url} = buildConfig;
      controllerProps.context = {
        initialState: {
          view: {url},
          language,
          country,
          currency,
        },
      };
    },

    wireCart: () => {
      if (!controllerDefinitions?.cart || !buildConfig.cart) return;

      controllerProps.cart = {
        initialState: buildConfig.cart,
      };
    },

    wireRecommendations: () => {
      // TODO: KIT-4619: wire recommendations
    },
  };
}

/**
 * Applies common controller wiring for all solution types.
 */
function wireCommonControllers(
  wirer: ReturnType<typeof createControllerWirer>
): void {
  wirer.wireCart();
  wirer.wireContext();
}

/**
 * Applies solution-specific controller wiring based on the solution type.
 */
function wireSolutionSpecificControllers(
  solutionType: SolutionType,
  buildConfig: BuildConfig<SolutionType>,
  wirer: ReturnType<typeof createControllerWirer>
): void {
  switch (solutionType) {
    case SolutionType.search: {
      const {query} = buildConfig as SearchBuildConfig;
      if (typeof query === 'string') {
        wirer.wireParameterManager(query);
      }
      break;
    }

    case SolutionType.listing: {
      wirer.wireParameterManager();
      break;
    }

    case SolutionType.recommendation: {
      wirer.wireRecommendations();
      break;
    }

    case SolutionType.standalone:
      // No additional wiring needed for standalone
      break;

    default: {
      // Exhaustive check - TypeScript will error if we miss a case
      const _exhaustiveCheck: never = solutionType;
      throw new Error(`Unsupported solution type: ${_exhaustiveCheck}`);
    }
  }
}

/**
 * Converts simple user configuration (URL, language, currency, query) into the
 * nested structure required by the internal {@link Build} method. Automatically generates
 * appropriate controllers (context, cart, parameterManager) transparently.
 *
 * @param solutionType - The type of solution (search, listing, recommendation, standalone)
 * @param controllerDefinitions - Map of controller definitions to be initialized
 * @param buildConfig - Simple configuration object with simplified controller properties
 * @returns Formatted and validated controller properties map defined for the controller in the definition
 */
export function wireControllerParams<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  solutionType: SolutionType,
  controllerDefinitions: TControllerDefinitions,
  buildConfig: BuildConfig<SolutionType> & {
    controllers?: ControllersPropsMap;
  }
): InferControllerPropsMapFromDefinitions<TControllerDefinitions> {
  validateBuildConfig(solutionType, buildConfig);

  const controllerProps: ControllersPropsMap = buildConfig.controllers ?? {};
  const wirer = createControllerWirer(
    buildConfig,
    controllerDefinitions,
    controllerProps
  );

  wireCommonControllers(wirer);
  wireSolutionSpecificControllers(solutionType, buildConfig, wirer);

  return controllerProps as InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
}
