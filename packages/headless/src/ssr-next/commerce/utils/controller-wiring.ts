/**
 * Controller Wiring Utilities
 *
 * Transforms simple user configuration into complex internal controller structures.
 */

import {RecordValue, Schema} from '@coveo/bueno';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema.js';
import {requiredEmptyAllowedString} from '../../../utils/validate-payload.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {Parameters} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {BuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';

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

const recommendationsDefinition = {
  ...requiredDefinition,
  // recommendation:  // TODO: KIT-4619: support array of recommendations
};

export const listingDefinitionSchema = new Schema(listingDefinition);
export const searchDefinitionSchema = new Schema(searchDefinition);
export const standaloneDefinitionSchema = new Schema(standaloneDefinition);
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
  const validationMap: Record<SolutionType, Schema<object>> = {
    [SolutionType.listing]: listingDefinitionSchema,
    [SolutionType.search]: searchDefinitionSchema,
    [SolutionType.standalone]: standaloneDefinitionSchema,
    [SolutionType.recommendation]: recommendationsDefinitionSchema,
  };

  const schema = validationMap[solutionType as SolutionType];
  schema.validate(buildConfig);
}

/**
 * Controller wiring class that handles the complete wiring process.
 * Transforms simple user configuration into complex internal controller structures.
 */
class ControllerWirer {
  constructor(
    private buildConfig: BuildConfig<SolutionType>,
    private controllerDefinitions: CommerceControllerDefinitionsMap,
    private controllerProps: ControllersPropsMap
  ) {}

  private wireParameterManager(): void {
    if (!this.controllerDefinitions?.parameterManager) return;

    const {searchParams} = this.buildConfig;
    const {query, ...rest} =
      (searchParams as Parameters & {
        query?: string;
      }) || {};

    const parameters = {
      ...(query && {q: query}),
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
    // TODO: KIT-4619: wire recommendations
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
  buildConfig: BuildConfig<SolutionType> & {
    controllers?: ControllersPropsMap;
  }
): InferControllerPropsMapFromDefinitions<TControllerDefinitions> {
  validateBuildConfig(solutionType, buildConfig);

  const controllerProps: ControllersPropsMap = buildConfig.controllers ?? {};

  new ControllerWirer(buildConfig, controllerDefinitions, controllerProps).wire(
    solutionType
  );

  return controllerProps as InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
}
