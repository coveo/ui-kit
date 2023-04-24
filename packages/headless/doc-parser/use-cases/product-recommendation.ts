import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildContext',
    samplePaths: {
      react_fn: [
        'packages/samples/headless-react/src/components/context/context.ts',
      ],
    },
  },
  {
    initializer: 'buildCartRecommendationsList',
    samplePaths: {
      react_fn: [],
    },
  },
  {
    initializer: 'buildDictionaryFieldContext',
    samplePaths: {
      react_fn: [
        'packages/samples/headless-react/src/components/dictionary-field-context/dictionary-field-context.fn.ts',
      ],
    },
  },
  {
    initializer: 'buildFrequentlyBoughtTogetherList',
    samplePaths: {
      react_fn: [],
    },
  },
  {
    initializer: 'buildFrequentlyViewedDifferentCategoryList',
    samplePaths: {
      react_fn: [],
    },
  },
  {
    initializer: 'buildFrequentlyViewedSameCategoryList',
    samplePaths: {
      react_fn: [],
    },
  },
  {
    initializer: 'buildFrequentlyViewedTogetherList',
    samplePaths: {
      react_fn: [],
    },
  },
];

const actionLoaders: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadConfigurationActions',
  },
  {
    initializer: 'loadProductRecommendationsActions',
  },
  {
    initializer: 'loadContextActions',
  },
  {
    initializer: 'loadDictionaryFieldContextActions',
  },
  {
    initializer: 'loadSearchHubActions',
  },
  {
    initializer: 'loadClickAnalyticsActions',
  },
];

const engine: EngineConfiguration = {
  initializer: 'buildProductRecommendationEngine',
};

export const productRecommendationUseCase = {
  controllers,
  actionLoaders,
  engine,
};
