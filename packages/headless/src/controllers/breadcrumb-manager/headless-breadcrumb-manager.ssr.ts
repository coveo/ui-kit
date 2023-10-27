import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
} from './headless-breadcrumb-manager';

export * from './headless-breadcrumb-manager';

/**
 * @alpha
 */
export const defineBreadcrumbManager = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  BreadcrumbManager
> => ({
  build: (engine) => buildBreadcrumbManager(engine),
});
