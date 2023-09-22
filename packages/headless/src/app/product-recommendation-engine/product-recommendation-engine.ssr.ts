/**
 * Utility functions to be used for Server Side Rendering.
 */
import {AnyAction} from '@reduxjs/toolkit';
import {Controller} from '../../controllers';
import {
  createWaitForActionMiddleware,
  mapObject,
  clone,
} from '../../utils/utils';
import {EngineDefinitionBuildOptionsWithProps} from '../ssr-engine/types/build';
import {
  ControllerDefinitionsMap,
  EngineStaticState,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
  OptionsExtender,
} from '../ssr-engine/types/common';
import {
  EngineDefinition,
  EngineDefinitionOptions,
} from '../ssr-engine/types/core-engine';
import {
  ProductRecommendationEngine,
  ProductRecommendationEngineOptions,
  buildProductRecommendationEngine,
} from './product-recommendation-engine';
import {getProductRecommendations} from '../../features/product-recommendations/product-recommendations-actions';

/**
 * @internal
 */
export type ProductRecommendationEngineDefinition<
  TControllers extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
> = EngineDefinition<
  ProductRecommendationEngine,
  TControllers,
  ProductRecommendationEngineOptions
>;

/**
 * @internal
 */
export type ProductRecommendationEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
> = EngineDefinitionOptions<ProductRecommendationEngineOptions, TControllers>;

function isSearchCompletedAction(
  action: AnyAction
): action is ReturnType<
  (typeof getProductRecommendations)['fulfilled' | 'rejected']
> {
  return /^productRecommendations\/get\/(fulfilled|rejected)$/.test(
    action.type
  );
}

/**
 * @internal
 *
 * Initializes a Search engine definition in SSR with given controllers definitions and search engine config.
 * @returns Three utility functions to fetch initial state of engine in SSR, hydrate the state in CSR
 *  and a build function that can be used for edge cases requiring more control.
 */
export function defineProductRecommendationEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
>({
  controllers: controllerDefinitions,
  ...engineOptions
}: ProductRecommendationEngineDefinitionOptions<TControllerDefinitions>): ProductRecommendationEngineDefinition<TControllerDefinitions> {
  const build: ProductRecommendationEngineDefinition<TControllerDefinitions>['build'] =
    async (
      ...[buildOptions]: Parameters<
        ProductRecommendationEngineDefinition<TControllerDefinitions>['build']
      >
    ) => {
      const engine = buildProductRecommendationEngine(
        buildOptions?.extend
          ? await buildOptions.extend(engineOptions)
          : engineOptions
      );
      const controllerOptions =
        buildOptions && 'controllers' in buildOptions
          ? buildOptions.controllers
          : null;
      const controllers = controllerDefinitions
        ? mapObject(controllerDefinitions, (definition, key) =>
            'build' in definition
              ? definition.build(engine)
              : definition.buildWithProps(
                  engine,
                  controllerOptions?.[key as keyof typeof controllerOptions]
                )
          )
        : {};
      return {
        engine,
        controllers:
          controllers as InferControllersMapFromDefinition<TControllerDefinitions>,
      };
    };

  const fetchStaticState: ProductRecommendationEngineDefinition<TControllerDefinitions>['fetchStaticState'] =
    async (
      ...[executeOptions]: Parameters<
        ProductRecommendationEngineDefinition<TControllerDefinitions>['fetchStaticState']
      >
    ): Promise<
      EngineStaticState<
        {type: string},
        InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
      >
    > => {
      const {middleware, promise: searchCompletedPromise} =
        createWaitForActionMiddleware(isSearchCompletedAction);

      const extend: OptionsExtender<ProductRecommendationEngineOptions> = (
        options
      ) => ({
        ...options,
        middlewares: [...(options.middlewares ?? []), middleware],
      });
      const {engine, controllers} = await build({
        extend,
        ...(executeOptions?.controllers && {
          controllers: executeOptions.controllers,
        }),
      });

      engine.dispatch(getProductRecommendations());
      const searchAction = clone(await searchCompletedPromise);
      return {
        controllers: mapObject(controllers, (controller) => ({
          state: clone(controller.state),
        })) as InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>,
        searchAction,
      };
    };

  const hydrateStaticState: ProductRecommendationEngineDefinition<TControllerDefinitions>['hydrateStaticState'] =
    async (
      ...[hydrateOptions]: Parameters<
        ProductRecommendationEngineDefinition<TControllerDefinitions>['hydrateStaticState']
      >
    ) => {
      const {engine, controllers} = await build(
        'controllers' in hydrateOptions
          ? ({
              controllers: hydrateOptions.controllers,
            } as EngineDefinitionBuildOptionsWithProps<
              ProductRecommendationEngineOptions,
              TControllerDefinitions
            >)
          : {}
      );
      engine.dispatch(hydrateOptions.searchAction);
      return {engine, controllers};
    };

  return {
    build,
    fetchStaticState,
    hydrateStaticState,
  };
}
