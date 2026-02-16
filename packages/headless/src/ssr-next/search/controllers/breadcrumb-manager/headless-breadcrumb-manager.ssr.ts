import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  type BreadcrumbManager,
  buildBreadcrumbManager,
} from '../../../../controllers/breadcrumb-manager/headless-breadcrumb-manager.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/breadcrumb-manager/headless-breadcrumb-manager.js';

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
