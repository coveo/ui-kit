import {composeFunction} from '../../ssr-engine/common.js';
import {SolutionType} from '../types/common.js';
import {
  BuildParameters,
  HydrateStaticStateFromBuildResultParameters,
  HydrateStaticStateFunction,
  HydrateStaticStateParameters,
  CommerceControllerDefinitionsMap,
} from '../types/core-engine.js';
import {
  buildFactory,
  CommerceEngineDefinitionOptions,
} from './build-factory.js';

export const hydrateStaticStateFactory: <
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) => (
  solutionType: SolutionType
) => HydrateStaticStateFunction<TControllerDefinitions> =
  <TControllerDefinitions extends CommerceControllerDefinitionsMap>(
    controllerDefinitions: TControllerDefinitions,
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
          await hydrateStaticStateFactory<TControllerDefinitions>(
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

          // TODO: should be only one searchAction for search and listing
          searchActions.forEach((action) => {
            engine.dispatch(action);
          });
          await engine.waitForRequestCompletedAction();
          return {engine, controllers};
        },
      }
    );
