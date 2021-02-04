import {
  ApiItemKind,
  ApiModel,
  ApiEntryPoint,
  ApiPackage,
} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {resolveController} from './src/controller-resolver';

function findEntryPoint(apiPackage: ApiPackage) {
  return apiPackage.members.find(
    (m) => m.kind === ApiItemKind.EntryPoint
  ) as ApiEntryPoint;
}

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = findEntryPoint(apiPackage);

const config = {
  initializer: 'buildPager',
};

const result = resolveController(entryPoint, config.initializer);

writeFileSync('dist/parsed_doc.json', JSON.stringify(result, null, 2));
