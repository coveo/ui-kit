import * as z from '@coveo/bueno/zod';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {
  parametersDefinition,
  parametersDefinitionShape,
} from '../../../features/commerce/parameters/parameters-schema.js';
import {
  nonEmptyString,
  nonRequiredEmptyAllowedString,
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

const listingDefinitionSchema = z.object({
  context: contextDefinition,
  searchParams: z.optional(parametersDefinition),
});

const standaloneDefinitionSchema = z.object({
  context: contextDefinition,
});

const searchDefinitionSchema = z.object({
  context: contextDefinition,
  searchParams: z.optional(
    z.object({
      q: nonRequiredEmptyAllowedString,
      ...parametersDefinitionShape,
    })
  ),
});

const recommendationsDefinitionSchema = (recommendationName: string[]) =>
  z.object({
    context: contextDefinition,
    recommendations: z.array(
      z.enum(recommendationName as [string, ...string[]])
    ),
    productId: nonEmptyString,
  });

export {
  listingDefinitionSchema,
  searchDefinitionSchema,
  standaloneDefinitionSchema,
  recommendationsDefinitionSchema,
};

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
  const validationMap: Record<SolutionType, z.ZodMiniType> = {
    [SolutionType.listing]: listingDefinitionSchema,
    [SolutionType.search]: searchDefinitionSchema,
    [SolutionType.standalone]: standaloneDefinitionSchema,
    [SolutionType.recommendation]: recommendationsDefinitionSchema(
      Object.keys(getRecommendationDefinitions(controllerDefinitions))
    ),
  };

  const schema = validationMap[solutionType as SolutionType];
  schema.parse(buildConfig);
}

/**
 * Controller wiring class that handles the complete wiring process.
 * Transforms simple user configuration into complex internal controller structures.
 */
class ControllerWirer<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
  TSolutionType extends SolutionType,
> {
  constructor(
    private buildConfig: BuildConfig<TControllerDefinitions, TSolutionType>,
    private controllerDefinitions: CommerceControllerDefinitionsMap,
    private controllerProps: ControllersPropsMap
  ) {}

  private wireParameterManager(): void {
    if (!this.controllerDefinitions?.parameterManager) return;

    const {searchParams} = this.buildConfig;
    const {q, ...rest} =
      (searchParams as Parameters & {
        q?: string;
      }) || {};

    const parameters = {
      ...{q},
      ...(rest && typeof rest === 'object' ? rest : {}),
    };

    this.controllerProps.parameterManager = {
      initialState: {parameters},
    };
  }

  private wireContext(): void {
    if (!this.controllerDefinitions?.context) return;

    const {context} = this.buildConfig;
    this.controllerProps.context = {
      initialState: {
        ...context,
      },
    };
  }

  private wireCart(): void {
    if (!this.controllerDefinitions?.cart || !this.buildConfig.cart) return;

    this.controllerProps.cart = {
      initialState: this.buildConfig.cart,
    };
  }

  private wireRecommendations(): void {
    if (!('recommendations' in this.buildConfig)) {
      return;
    }
    for (const recController in this.controllerDefinitions) {
      if (
        isRecommendationDefinition(this.controllerDefinitions[recController])
      ) {
        this.controllerProps[recController] = {
          initialState: {
            ...('productId' in this.buildConfig && {
              productId: this.buildConfig.productId,
            }),
          },
        };
      }
    }
  }

  /**
   * Wires all controllers based on solution type and controller definitions.
   * Handles the complete wiring process in a sequential manner.
   */
  public wire(solutionType: SolutionType): void {
    // Wire common controllers that apply to all solution types
    this.wireCart();
    this.wireContext();

    // Wire solution-specific controllers
    switch (solutionType) {
      case SolutionType.search:
      case SolutionType.listing: {
        this.wireParameterManager();
        break;
      }

      case SolutionType.recommendation: {
        this.wireRecommendations();
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

  new ControllerWirer(buildConfig, controllerDefinitions, controllerProps).wire(
    solutionType
  );

  return controllerProps as InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
}
