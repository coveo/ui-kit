import {ApiModel} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {
  ActionLoader,
  resolveActionLoader,
} from './src/headless-export-resolvers/action-loader-resolver';
import {
  Controller,
  resolveController,
} from './src/headless-export-resolvers/controller-resolver';
import {
  Engine,
  resolveEngine,
} from './src/headless-export-resolvers/engine-resolver';
// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-89: Uncomment when we're ready to make the Commerce sub-package public.
//import {commerceUseCase} from './use-cases/commerce';
import {searchUseCase} from './use-cases/search';
import {UseCaseConfiguration} from './use-cases/use-case-configuration';

interface UseCase {
  name: string;
  entryFile: string;
  config: UseCaseConfiguration;
}

interface ResolvedUseCase {
  name: string;
  controllers: Controller[];
  actions: ActionLoader[];
  engine: Engine;
}

export const useCases: UseCase[] = [
  {
    name: 'search',
    entryFile: 'temp/index.api.json',
    config: searchUseCase,
  },
  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-89: Uncomment when we're ready to make the Commerce sub-package public.
  //{
  //  name: 'commerce',
  //  entryFile: 'temp/commerce.api.json',
  //  config: commerceUseCase,
  //},
];

function resolveUseCase(useCase: UseCase): ResolvedUseCase {
  const {name, entryFile, config} = useCase;
  process.env['currentUseCaseName'] = name;
  const apiModel = new ApiModel();
  const apiPackage = apiModel.loadPackage(entryFile);
  const entryPoint = apiPackage.entryPoints[0];

  const controllers = config.controllers.map((controller) =>
    resolveController(entryPoint, controller)
  );
  const actions = config.actionLoaders.map((loader) =>
    resolveActionLoader(entryPoint, loader)
  );

  const engine = resolveEngine(entryPoint, config.engine);

  return {name, controllers, actions, engine};
}

const resolved = useCases.map(resolveUseCase);

writeFileSync('dist/parsed_doc.json', JSON.stringify(resolved, null, 2));
