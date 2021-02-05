import {ApiModel} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {resolveController} from './src/controller-resolver';

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = apiPackage.entryPoints[0];

const config = {
  initializer: 'buildPager',
};

const result = resolveController(entryPoint, config.initializer);

writeFileSync('dist/parsed_doc.json', JSON.stringify(result, null, 2));
