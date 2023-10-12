import {ApiModel} from '@microsoft/api-extractor-model';
import {dirname, resolve} from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function buildMockEntryPoint() {
  const path = resolve(__dirname, './mock-api.json');
  const apiModel = new ApiModel();
  const apiPackage = apiModel.loadPackage(path);

  return apiPackage.entryPoints[0];
}
