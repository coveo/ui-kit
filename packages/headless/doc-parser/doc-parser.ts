import {ApiModel} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {
  ControllerConfiguration,
  resolveController,
} from './src/controller-resolver';

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = apiPackage.entryPoints[0];

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildPager',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/pager/pager.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/pager/pager.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildContext',
    samplePaths: {
      react_fn: [
        'packages/samples/headless-react/src/components/context/context.ts',
      ],
    },
  },
  {
    initializer: 'buildDidYouMean',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/did-you-mean/did-you-mean.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/did-you-mean/did-you-mean.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildFacetManager',
    samplePaths: {},
  },
  {
    initializer: 'buildQueryError',
    samplePaths: {},
  },
];

const result = controllers.map((controller) =>
  resolveController(entryPoint, controller)
);

writeFileSync('dist/parsed_doc.json', JSON.stringify(result, null, 2));
