import {composeFunction} from '../../common/controller-utils.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {
  BuildParameters,
  CommerceControllerDefinitionsMap,
  HydrateStaticStateFromBuildResultParameters,
  HydrateStaticStateFunction,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import {
  buildFactory,
  type CommerceEngineDefinitionOptions,
} from './build-factory.js';

export const hydratedStaticStateFactory: <
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions | undefined,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) => (
  solutionType: SolutionType
) => HydrateStaticStateFunction<TControllerDefinitions> =
  <TControllerDefinitions extends CommerceControllerDefinitionsMap>(
    controllerDefinitions: TControllerDefinitions | undefined,
    options: CommerceEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  (solutionType: SolutionType) =>
    composeFunction(
      async (
        ...params: HydrateStaticStateParameters<TControllerDefinitions>
      ) => {
        const solutionTypeBuild = await buildFactory(controllerDefinitions, {
          ...options,
        })(solutionType);
        const buildResult = await solutionTypeBuild(
          ...(params as BuildParameters<TControllerDefinitions>)
        );
        const staticStateBuild =
          await hydratedStaticStateFactory<TControllerDefinitions>(
            controllerDefinitions,
            options
          )(solutionType);
        const staticState = await staticStateBuild.fromBuildResult({
          buildResult,
          searchActions: params[0]!.searchActions,
        });
        return staticState;
      },
      {
        fromBuildResult: async (
          ...params: HydrateStaticStateFromBuildResultParameters<TControllerDefinitions>
        ) => {
          const [
            {
              buildResult: {engine, controllers},
              searchActions,
            },
          ] = params;

          searchActions.forEach((action) => {
            engine.dispatch(action);
          });
          await engine.waitForRequestCompletedAction();
          return {engine, controllers};
        },
      }
    );
