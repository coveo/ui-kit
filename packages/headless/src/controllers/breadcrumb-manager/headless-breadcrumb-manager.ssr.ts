import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
} from './headless-breadcrumb-manager';

export * from './headless-breadcrumb-manager';

export interface BreadcrumbManagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, BreadcrumbManager> {}

export function defineBreadcrumbManager(): BreadcrumbManagerDefinition {
  return {
    build: (engine) => buildBreadcrumbManager(engine),
  };
}
