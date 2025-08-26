import {ArrayValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema.js';
import {
  nonEmptyString,
  requiredEmptyAllowedString,
} from '../../../utils/validate-payload.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {Parameters} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {BuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import {
  getRecommendationDefinitions,
  isRecommendationDefinition,
} from './recommendation-filter.js';

const requiredDefinition = {
  context: new RecordValue({
    options: {required: true},
    values: contextDefinition,
  }),
};

const listingDefinition = {
  ...requiredDefinition,
  searchParams: new RecordValue({
    values: parametersDefinition,
  }),
};

const standaloneDefinition = {
  ...requiredDefinition,
};

const searchDefinition = {
  ...requiredDefinition,
  searchParams: new RecordValue({
    options: {required: true},
    values: {query: requiredEmptyAllowedString, ...parametersDefinition},
  }),
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
    wireParameterManager: () => {
      if (!controllerDefinitions?.parameterManager) return;

      const {searchParams} = buildConfig;
      const {query, ...rest} =
        (searchParams as Parameters & {
          query?: string;
        }) || {};

      const parameters = {
        ...(query && {q: query}),
        ...(rest && typeof rest === 'object' ? rest : {}),
      };

      controllerProps.parameterManager = {
        initialState: {parameters},
      };
    },

    wireContext: () => {
      if (!controllerDefinitions?.context) return;

      const {context} = buildConfig;
      controllerProps.context = {
        initialState: {
          ...context,
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

function wireSolutionSpecificControllers(
  solutionType: SolutionType,
  wirer: ReturnType<typeof createControllerWirer>
): void {
  switch (solutionType) {
    case SolutionType.search: {
      wirer.wireParameterManager();
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
  wireSolutionSpecificControllers(solutionType, wirer);

  return controllerProps as InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
}
