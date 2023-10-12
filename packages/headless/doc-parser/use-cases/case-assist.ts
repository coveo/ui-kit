import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver.js';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver.js';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver.js';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildCaseInput',
    samplePaths: {},
  },
  {
    initializer: 'buildCaseField',
    samplePaths: {},
  },
  {
    initializer: 'buildCaseAssistQuickview',
    samplePaths: {},
  },
  {
    initializer: 'buildDocumentSuggestionList',
    samplePaths: {},
  },
];

const actionLoaders: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadCaseInputActions',
  },
  {
    initializer: 'loadCaseFieldActions',
  },
  {
    initializer: 'loadDocumentSuggestionActions',
  },
  {
    initializer: 'loadCaseAssistAnalyticsActions',
  },
  {
    initializer: 'loadGenericAnalyticsActions',
  },
];

const engine: EngineConfiguration = {
  initializer: 'buildCaseAssistEngine',
};

export const caseAssistUseCase = {controllers, actionLoaders, engine};
