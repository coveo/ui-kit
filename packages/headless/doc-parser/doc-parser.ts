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
import {searchUseCase} from './use-cases/search';

interface ResolvedUseCase {
  controllers: Controller[];
  actionLoaders: ActionLoader[];
  engine: Engine;
}

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = apiPackage.entryPoints[0];

const controllers = searchUseCase.controllers.map((controller) =>
  resolveController(entryPoint, controller)
);
const actionLoaders = searchUseCase.actionLoaders.map((loader) =>
  resolveActionLoader(entryPoint, loader)
);

const engine = resolveEngine(entryPoint, searchUseCase.engine);

const resolved: ResolvedUseCase = {controllers, actionLoaders, engine};

writeFileSync('dist/parsed_doc.json', JSON.stringify(resolved, null, 2));
