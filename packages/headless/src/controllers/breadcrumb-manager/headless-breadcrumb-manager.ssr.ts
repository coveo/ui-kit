import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  type BreadcrumbManager,
  buildBreadcrumbManager,
} from './headless-breadcrumb-manager.js';

export * from './headless-breadcrumb-manager.js';

export interface BreadcrumbManagerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, BreadcrumbManager> {}

/**
 * Defines a `BreadcrumbManager` controller instance.
 * @group Definers
 *
 * @returns The `BreadcrumbManager` controller definition.
 * */
export function defineBreadcrumbManager(): BreadcrumbManagerDefinition {
  return {
    build: (engine) => buildBreadcrumbManager(engine),
  };
}
