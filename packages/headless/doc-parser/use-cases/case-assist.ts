import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

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
    initializer: 'buildQuickview',
    samplePaths: {},
  },
  {
    initializer: 'buildDocumentSuggestionList',
    samplePaths: {},
  },
  {
    initializer: 'buildDocumentSuggestionList',
    samplePaths: {},
  },
  {
    initializer: 'buildInteractiveResult',
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
