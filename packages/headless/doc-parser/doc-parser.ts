import {ApiModel} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {resolveActionLoader} from './src/headless-export-resolvers/action-loader-resolver';
import {resolveController} from './src/headless-export-resolvers/controller-resolver';
import {searchConfiguration} from './use-cases/search';

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = apiPackage.entryPoints[0];

const controllers = searchConfiguration.controllers.map((controller) =>
  resolveController(entryPoint, controller)
);
const actionLoaders = searchConfiguration.actionLoaders.map((loader) =>
  resolveActionLoader(entryPoint, loader)
);

const result = {controllers, actionLoaders};

writeFileSync('dist/parsed_doc.json', JSON.stringify(result, null, 2));
