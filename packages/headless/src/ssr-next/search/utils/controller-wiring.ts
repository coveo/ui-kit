import {RecordValue, Schema} from '@coveo/bueno';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {nonRequiredEmptyAllowedString} from '../../../utils/validate-payload.js';
import type {ControllersPropsMap} from '../../common/types/controllers.js';
import type {BuildConfig, SSRSearchEngine} from '../types/build.js';
import type {ControllerDefinitionsMap} from '../types/controller-definition.js';
import type {InferControllerPropsMapFromDefinitions} from '../types/controller-inference.js';

const searchDefinition = {
  searchParams: new RecordValue({
    options: {required: false},
    values: {q: nonRequiredEmptyAllowedString},
  }),
};

export const searchDefinitionSchema = new Schema(searchDefinition);

/**
 * Validates the build configuration for search.
 */
function validateBuildConfig(buildConfig: BuildConfig): void {
  searchDefinitionSchema.validate(buildConfig);
}

/**
 * Controller wiring class that handles the complete wiring process for search.
 * Transforms simple user configuration into complex internal controller structures.
 */
class ControllerWirer<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SSRSearchEngine,
    Controller
  >,
> {
  constructor(
    private buildConfig: BuildConfig,
    private controllerDefinitions: TControllerDefinitions,
    private controllerProps: ControllersPropsMap
  ) {}

  private wireParameterManager(): void {
    if (!this.controllerDefinitions?.parameterManager) return;

    const {searchParams} = this.buildConfig;

    this.controllerProps.parameterManager = {
      initialState: {
        parameters: searchParams || {},
      },
    };
  }

  /**
   * Wires all controllers based on controller definitions.
   * Handles the complete wiring process in a sequential manner.
   */
  public wire(): void {
    this.wireParameterManager();
  }
}

/**
 * Converts simple user configuration (searchParams) into the
 * nested structure required by the internal controller system. Automatically generates
 * appropriate controllers (parameterManager) transparently.
 *
 * @param controllerDefinitions - Map of controller definitions to be initialized
 * @param buildConfig - Simple configuration object with simplified controller properties
 * @returns Formatted and validated controller properties map defined for the controller in the definition
 */
export function wireControllerParams<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SSRSearchEngine,
    Controller
  >,
>(
  controllerDefinitions: TControllerDefinitions,
  buildConfig: BuildConfig & {
    controllers?: ControllersPropsMap;
  }
): InferControllerPropsMapFromDefinitions<TControllerDefinitions> {
  validateBuildConfig(buildConfig);

  const controllerProps: ControllersPropsMap = buildConfig.controllers ?? {};

  new ControllerWirer(
    buildConfig,
    controllerDefinitions,
    controllerProps
  ).wire();

  return controllerProps as InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
}
