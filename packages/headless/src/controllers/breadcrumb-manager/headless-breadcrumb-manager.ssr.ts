import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
} from './headless-breadcrumb-manager';

export * from './headless-breadcrumb-manager';

export function defineBreadcrumbManager(): ControllerDefinitionWithoutProps<
  SearchEngine,
  BreadcrumbManager
> {
  return {
    build: (engine) => buildBreadcrumbManager(engine),
  };
}
