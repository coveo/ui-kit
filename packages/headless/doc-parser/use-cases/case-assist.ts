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
];

const engine: EngineConfiguration = {
  initializer: 'buildCaseAssistEngine',
};

export const caseAssistUseCase = {controllers, actionLoaders, engine};
