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
import {productRecommendationUseCase} from './use-cases/product-recommendation';
import {recommendationUseCase} from './use-cases/recommendation';
import {searchUseCase} from './use-cases/search';
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

const useCases: UseCase[] = [
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
    name: 'product-recommendation',
    entryFile: 'temp/product-recommendation.api.json',
    config: productRecommendationUseCase,
  },
];

function resolveUseCase(useCase: UseCase): ResolvedUseCase {
  const {name, entryFile, config} = useCase;
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
