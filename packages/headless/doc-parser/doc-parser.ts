import {ApiModel} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {
  ActionLoader,
  resolveActionLoader,
} from './src/headless-export-resolvers/action-loader-resolver';
import {
  Controller,
  resolveController,
} from './src/headless-export-resolvers/controller-resolver';
import {
  Engine,
  resolveEngine,
} from './src/headless-export-resolvers/engine-resolver';
// import {SSRController} from './src/headless-export-resolvers/ssr-controller-resolver';
// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-89: Uncomment when we're ready to make the Commerce sub-package public.
//import {commerceUseCase} from './use-cases/commerce';
import {searchUseCase} from './use-cases/search';
import {ssrSearchUseCase} from './use-cases/ssr.search';
import {UseCaseConfiguration} from './use-cases/use-case-configuration';

interface UseCase {
  name: string;
  entryFile: string;
  config: UseCaseConfiguration;
}

interface ResolvedUseCase {
  name: string;
  controllers: Controller[];
  actions: ActionLoader[];
  engine: Engine;
}

// interface ResolvedSSRUseCase {
//   name: string;
//   controllers: SSRController[]; // TODO: check if can replace with Controller interface
//   // engine: {initializer: string}; // TODO: what is that
//   engine: Engine;
// }

const ssrUseCases: UseCase[] = [
  {
    name: 'ssr.search',
    entryFile: 'temp/ssr.search.api.json',
    config: ssrSearchUseCase,
  },
];

export const useCases: UseCase[] = [
  {
    name: 'search',
    entryFile: 'temp/index.api.json',
    config: searchUseCase,
  },
  // {
  //   name: 'recommendation',
  //   entryFile: 'temp/recommendation.api.json',
  //   config: recommendationUseCase,
  // },
  // {
  //   name: 'product-recommendation',
  //   entryFile: 'temp/product-recommendation.api.json',
  //   config: productRecommendationUseCase,
  // },
  // {
  //   name: 'product-listing',
  //   entryFile: 'temp/product-listing.api.json',
  //   config: productListingUseCase,
  // },
  // {
  //   name: 'case-assist',
  //   entryFile: 'temp/case-assist.api.json',
  //   config: caseAssistUseCase,
  // },
  // {
  //   name: 'insight',
  //   entryFile: 'temp/insight.api.json',
  //   config: insightUseCase,
  // },
  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-89: Uncomment when we're ready to make the Commerce sub-package public.
  //{
  //  name: 'commerce',
  //  entryFile: 'temp/commerce.api.json',
  //  config: commerceUseCase,
  //},
];

export function resolveUseCase(useCase: UseCase): ResolvedUseCase {
  const {name, entryFile, config} = useCase;
  process.env['currentUseCaseName'] = name;
  const apiModel = new ApiModel();
  const apiPackage = apiModel.loadPackage(entryFile);
  const entryPoint = apiPackage.entryPoints[0];

  const controllers = config.controllers.map((controller) =>
    resolveController(entryPoint, controller)
  );
  // const actions = config.actionLoaders.map((loader) =>
  //   resolveActionLoader(entryPoint, loader)
  // );

  const engine = resolveEngine(entryPoint, config.engine);

  return {name, controllers, engine, actions: []};
}

() => useCases.map(resolveUseCase);

// writeFileSync('dist/parsed_doc.json', JSON.stringify(resolved, null, 2));

function resolveSSRUseCase(ssrUseCase: UseCase): ResolvedUseCase {
  const {name, entryFile, config} = ssrUseCase;
  process.env['currentUseCaseName'] = name;
  const apiModel = new ApiModel();
  const apiPackage = apiModel.loadPackage(entryFile);
  const entryPoint = apiPackage.entryPoints[0];

  const controllers = config.controllers.map((controller) =>
    resolveController(entryPoint, controller)
  );
  const actions = config.actionLoaders.map((loader) =>
    resolveActionLoader(entryPoint, loader)
  );

  const engine = resolveEngine(entryPoint, config.engine);

  return {name, controllers, engine, actions};
}

const ssrResolved = ssrUseCases.map(resolveSSRUseCase);

writeFileSync('dist/ssr_parsed_doc.json', JSON.stringify(ssrResolved, null, 2));
