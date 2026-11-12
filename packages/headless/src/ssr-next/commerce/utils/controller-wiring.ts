import {ArrayValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import {contextDefinition} from '../../../features/commerce/context/context-validation.js';
import {parametersDefinition} from '../../../features/commerce/parameters/parameters-schema.js';
import {nonEmptyString, nonRequiredEmptyAllowedString} from '../../../utils/validate-payload.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {ContextOptions} from '../controllers/context/headless-context.ssr.js';
import type {Parameters} from '../controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
import type {BuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import {getRecommendationDefinitions, isRecommendationDefinition} from './recommendation-filter.js';

const commonDefinition = (recommendationNames: string[]) => ({
  context: new RecordValue({
    options: {required: true},
    values: contextDefinition,
  }),
  recommendations: new ArrayValue({
    each: new StringValue({
      required: true,
      constrainTo: recommendationNames,
      emptyAllowed: false,
    }),
    required: false,
  }),
  productId: nonEmptyString,
});

const listingDefinition = (recommendationNames: string[]) => ({
  ...commonDefinition(recommendationNames),
  searchParams: new RecordValue({
    values: parametersDefinition,
  }),
});

const standaloneDefinition = (recommendationNames: string[]) => ({
  ...commonDefinition(recommendationNames),
});

const searchDefinition = (recommendationNames: string[]) => ({
  ...commonDefinition(recommendationNames),
  searchParams: new RecordValue({
    options: {required: false},
    values: {q: nonRequiredEmptyAllowedString, ...parametersDefinition},
  }),
});

export const listingDefinitionSchema = (recommendationNames: string[]) =>
  new Schema(listingDefinition(recommendationNames));
export const searchDefinitionSchema = (recommendationNames: string[]) =>
  new Schema(searchDefinition(recommendationNames));
export const standaloneDefinitionSchema = (recommendationNames: string[]) =>
  new Schema(standaloneDefinition(recommendationNames));

/**
 * Validates the build configuration based on the solution type.
 */
function validateBuildConfig<TControllerDefinitions extends CommerceControllerDefinitionsMap>(
  solutionType: SolutionType,
  controllerDefinitions: CommerceControllerDefinitionsMap,
  buildConfig: BuildConfig<TControllerDefinitions, SolutionType>
): void {
  const recommendationNames = Object.keys(getRecommendationDefinitions(controllerDefinitions));
  const validationMap: Record<SolutionType, Schema<object>> = {
    [SolutionType.listing]: listingDefinitionSchema(recommendationNames),
    [SolutionType.search]: searchDefinitionSchema(recommendationNames),
    [SolutionType.standalone]: standaloneDefinitionSchema(recommendationNames),
  };

  const schema = validationMap[solutionType as SolutionType];
  schema.validate(
    buildConfig,
    `Check the options passed to fetchStaticState() of the ${solutionType} engine definition.`
  );
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
      // The view URL is resolved by `withDefaultViewUrl()` before the controllers are wired.
      initialState: {...context} as ContextOptions,
    };
  }

  private wireCart(): void {
    if (!this.controllerDefinitions?.cart || !this.buildConfig.cart) return;

    this.controllerProps.cart = {
      initialState: this.buildConfig.cart,
    };
  }

  /**
   * Seeds every recommendation controller with the product being viewed. Which slots are requested is
   * decided later, from the `recommendations` list, when the controllers are refreshed.
   */
  private wireRecommendations(): void {
    const {productId} = this.buildConfig;
    for (const recController in this.controllerDefinitions) {
      if (isRecommendationDefinition(this.controllerDefinitions[recController])) {
        this.controllerProps[recController] = {
          ...(productId !== undefined && {productId}),
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
    this.wireRecommendations();

    // Wire solution-specific controllers
    switch (solutionType) {
      case SolutionType.search:
      case SolutionType.listing: {
        this.wireParameterManager();
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
 * @param solutionType - The type of solution (search, listing, standalone)
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

  const controllerProps: ControllersPropsMap = {...buildConfig.controllers};

  new ControllerWirer(buildConfig, controllerDefinitions, controllerProps).wire(solutionType);

  return controllerProps as InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
}
