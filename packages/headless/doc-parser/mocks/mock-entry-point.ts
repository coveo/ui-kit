import {ApiModel} from '@microsoft/api-extractor-model';
import {resolve} from 'path';

export function buildMockEntryPoint() {
  const path = resolve(__dirname, './mock-api.json');
  const apiModel = new ApiModel();
  const apiPackage = apiModel.loadPackage(path);

  return apiPackage.entryPoints[0];
}
