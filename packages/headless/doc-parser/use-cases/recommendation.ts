import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildRecommendationList',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/recommendation-list/recommendation-list.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/recommendation-list/recommendation-list.fn.tsx',
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
];

const actionLoaders: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadConfigurationActions',
  },
  {
    initializer: 'loadAdvancedSearchQueryActions',
  },
  {
    initializer: 'loadContextActions',
  },
  {
    initializer: 'loadFieldActions',
  },
  {
    initializer: 'loadPipelineActions',
  },
  {
    initializer: 'loadSearchHubActions',
  },
  {
    initializer: 'loadDebugActions',
  },
  {
    initializer: 'loadRecommendationActions',
  },
  {
    initializer: 'loadClickAnalyticsActions',
  },
];

const engine: EngineConfiguration = {
  initializer: 'buildRecommendationEngine',
};

export const recommendationUseCase = {controllers, actionLoaders, engine};
