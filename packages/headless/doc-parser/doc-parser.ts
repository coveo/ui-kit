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
import {caseAssistUseCase} from './use-cases/case-assist';
import {commerceUseCase} from './use-cases/commerce';
import {insightUseCase} from './use-cases/insight';
import {recommendationUseCase} from './use-cases/recommendation';
import {searchUseCase} from './use-cases/search';
import {ssrSearchUseCase} from './use-cases/ssr-search';
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

export const useCases: UseCase[] = [
  {
    name: 'search',
    entryFile: 'temp/index.api.json',
    config: searchUseCase,
  },
  {
    name: 'recommendation',
    entryFile: 'temp/recommendation.api.json',
    config: recommendationUseCase,
  },
  {
    name: 'case-assist',
    entryFile: 'temp/case-assist.api.json',
    config: caseAssistUseCase,
  },
  {
    name: 'insight',
    entryFile: 'temp/insight.api.json',
    config: insightUseCase,
  },
  {
    name: 'ssr-search',
    entryFile: 'temp/ssr-search.api.json',
    config: ssrSearchUseCase,
  },
  {
    name: 'commerce',
    entryFile: 'temp/commerce.api.json',
    config: commerceUseCase,
  },
];

function resolveUseCase(useCase: UseCase): ResolvedUseCase {
  const {name, entryFile, config} = useCase;
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

  return {name, controllers, actions, engine};
}

const resolved = useCases.map(resolveUseCase);

writeFileSync('dist/parsed_doc.json', JSON.stringify(resolved, null, 2));
