import {ApiModel} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {
  ControllerConfiguration,
  resolveController,
} from './src/controller-resolver';

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = apiPackage.entryPoints[0];

const config: ControllerConfiguration = {
  initializer: 'buildPager',
  samplePaths: {
    react_class: [
      'packages/samples/headless-react/src/components/pager/pager.class.tsx',
    ],
    react_fn: [
      'packages/samples/headless-react/src/components/pager/pager.fn.tsx',
    ],
  },
};

const result = resolveController(entryPoint, config);

writeFileSync('dist/parsed_doc.json', JSON.stringify(result, null, 2));
