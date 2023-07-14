import {
  Controller,
  Facet,
  FacetProps,
  Middleware,
  NumericFacet,
  NumericFacetProps,
  ResultList,
  ResultListProps,
  SearchBox,
  SearchBoxProps,
  SearchEngine,
  SearchEngineOptions,
  SearchParameterManager,
  SearchParameters,
  buildFacet,
  buildNumericFacet,
  buildResultList,
  buildSearchBox,
  buildSearchEngine,
  buildSearchParameterManager,
} from '@coveo/headless';
import {mapObject} from '@/utils/object';
import {
  ControllerDefinitionWithProps,
  ControllerDefinitionWithoutProps,
  ControllerDefinitionsMap,
  EngineDefinition,
  EngineDefinitionBuildOptionsWithProps,
  EngineDefinitionOptions,
  EngineSnapshot,
  InferControllerSnapshotsMapFromDefinitions,
  InferControllersMapFromDefinition,
  OptionsExtender,
} from './ssr-headless.types';

export type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;

export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

type ExtractMethods<T extends Controller> = Omit<T, 'state' | 'subscribe'>;

export type SearchBoxMethods = ExtractMethods<SearchBox>;

export const defineSearchBox = (
  options?: SearchBoxProps
): ControllerDefinitionWithoutProps<SearchEngine, SearchBox> => ({
  build: (engine) => buildSearchBox(engine, options),
});

export type ResultListMethods = ExtractMethods<ResultList>;

export const defineResultList = (
  options?: ResultListProps
): ControllerDefinitionWithoutProps<SearchEngine, ResultList> => ({
  build: (engine) => buildResultList(engine, options),
});

export type FacetMethods = ExtractMethods<Facet>;

export const defineFacet = (
  options: FacetProps
): ControllerDefinitionWithoutProps<SearchEngine, Facet> => ({
  build: (engine) => buildFacet(engine, options),
});

export type NumericFacetMethods = ExtractMethods<NumericFacet>;

export const defineNumericFacet = (
  options: NumericFacetProps
): ControllerDefinitionWithoutProps<SearchEngine, NumericFacet> => ({
  build: (engine) => buildNumericFacet(engine, options),
});

export const defineSearchParameterManager = (): ControllerDefinitionWithProps<
  SearchEngine,
  SearchParameterManager,
  {initialParameters: SearchParameters}
> => ({
  buildWithProps: (engine, props) =>
    buildSearchParameterManager(engine, {
      initialState: {parameters: props.initialParameters},
    }),
});

export function defineSearchEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >
>({
  controllers: controllerDefinitions,
  ...engineOptions
}: SearchEngineDefinitionOptions<TControllerDefinitions>): SearchEngineDefinition<TControllerDefinitions> {
  const build: SearchEngineDefinition<TControllerDefinitions>['build'] = async (
    ...[buildOptions]: Parameters<
      SearchEngineDefinition<TControllerDefinitions>['build']
    >
  ) => {
    const engine = buildSearchEngine(
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

  const executeOnce: SearchEngineDefinition<TControllerDefinitions>['executeOnce'] =
    (
      ...[executeOptions]: Parameters<
        SearchEngineDefinition<TControllerDefinitions>['executeOnce']
      >
    ) =>
      new Promise<
        EngineSnapshot<
          {type: string},
          InferControllerSnapshotsMapFromDefinitions<TControllerDefinitions>
        >
      >(async (resolve, reject) => {
        const middleware: Middleware = () => (next) => (action) => {
          next(action);
          if (action.type === 'search/executeSearch/fulfilled') {
            resolve({
              controllers: mapObject(controllers, (controller) => ({
                initialState: controller.state,
              })) as InferControllerSnapshotsMapFromDefinitions<TControllerDefinitions>,
              searchFulfilledAction: JSON.parse(JSON.stringify(action)),
            });
          }
          if (action.type === 'search/executeSearch/rejected') {
            reject(JSON.parse(JSON.stringify(action)));
          }
        };
        const extend: OptionsExtender<SearchEngineOptions> = (options) => ({
          ...options,
          middlewares: [...(options.middlewares ?? []), middleware],
        });
        const {engine, controllers} = await build({
          extend,
          ...(executeOptions?.controllers && {
            controllers: executeOptions.controllers,
          }),
        });
        engine.executeFirstSearch();
      });

  const hydrate: SearchEngineDefinition<TControllerDefinitions>['hydrate'] =
    async (
      ...[hydrateOptions]: Parameters<
        SearchEngineDefinition<TControllerDefinitions>['hydrate']
      >
    ) => {
      const {engine, controllers} = await build(
        'controllers' in hydrateOptions
          ? ({
              controllers: hydrateOptions.controllers,
            } as EngineDefinitionBuildOptionsWithProps<
              SearchEngineOptions,
              TControllerDefinitions
            >)
          : {}
      );
      engine.dispatch(hydrateOptions.searchFulfilledAction);
      return {engine, controllers};
    };

  return {
    executeOnce,
    hydrate,
    build,
  };
}
