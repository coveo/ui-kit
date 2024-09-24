import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
} from './headless-breadcrumb-manager.js';

export * from './headless-breadcrumb-manager.js';

export interface BreadcrumbManagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, BreadcrumbManager> {}

export function defineBreadcrumbManager(): BreadcrumbManagerDefinition {
  return {
    build: (engine) => buildBreadcrumbManager(engine),
  };
}
