/**
 * Controller Wiring Utilities
 *
 * Transforms simple user configuration into complex internal controller structures.
 */

import {ArrayValue, Schema, StringValue} from '@coveo/bueno';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {
  nonEmptyString,
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {BuildConfig, SearchBuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import {
  getRecommendationDefinitions,
  isRecommendationDefinition,
} from './recommendation-filter.js';

const requiredDefinition = {
  language: contextDefinition.language,
  country: contextDefinition.country,
  currency: contextDefinition.currency,
  url: requiredNonEmptyString,
};

const listingDefinition = {
  ...requiredDefinition,
};

const standaloneDefinition = {
  ...requiredDefinition,
};

const searchDefinition = {
  ...requiredDefinition,
  query: requiredEmptyAllowedString,
};

const recommendationsDefinition = (recommendationName: string[]) => ({
  ...requiredDefinition,
  recommendations: new ArrayValue({
    each: new StringValue({
      required: true,
      constrainTo: recommendationName,
      emptyAllowed: false,
    }),
    required: true,
  }),
  productId: nonEmptyString,
});

export const listingDefinitionSchema = new Schema(listingDefinition);
export const searchDefinitionSchema = new Schema(searchDefinition);
export const standaloneDefinitionSchema = new Schema(standaloneDefinition);
export const recommendationsDefinitionSchema = (recommendationName: string[]) =>
  new Schema(recommendationsDefinition(recommendationName));

/**
 * Validates the build configuration based on the solution type.
 */
function validateBuildConfig<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  solutionType: SolutionType,
  controllerDefinitions: CommerceControllerDefinitionsMap,
  buildConfig: BuildConfig<TControllerDefinitions, SolutionType>
): void {
  const validationMap: Record<SolutionType, Schema<object>> = {
    [SolutionType.listing]: listingDefinitionSchema,
    [SolutionType.search]: searchDefinitionSchema,
    [SolutionType.standalone]: standaloneDefinitionSchema,
    [SolutionType.recommendation]: recommendationsDefinitionSchema(
      Object.keys(getRecommendationDefinitions(controllerDefinitions))
    ),
  };

  const schema = validationMap[solutionType as SolutionType];
  schema.validate(buildConfig);
}

function createControllerWirer<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  buildConfig: BuildConfig<TControllerDefinitions, SolutionType>,
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
      if (!('recommendations' in buildConfig)) {
        return;
      }
      for (const recController in controllerDefinitions) {
        if (isRecommendationDefinition(controllerDefinitions[recController])) {
          controllerProps[recController] = {
            initialState: {
              ...('productId' in buildConfig && {
                productId: buildConfig.productId,
              }),
            },
          };
        }
      }
    },
  };
}

function wireCommonControllers(
  wirer: ReturnType<typeof createControllerWirer>
): void {
  wirer.wireCart();
  wirer.wireContext();
}

function wireSolutionSpecificControllers<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  solutionType: SolutionType,
  buildConfig: BuildConfig<TControllerDefinitions, SolutionType>,
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
  buildConfig: BuildConfig<TControllerDefinitions, SolutionType> & {
    controllers?: ControllersPropsMap;
  }
): InferControllerPropsMapFromDefinitions<TControllerDefinitions> {
  validateBuildConfig(solutionType, controllerDefinitions, buildConfig);

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
