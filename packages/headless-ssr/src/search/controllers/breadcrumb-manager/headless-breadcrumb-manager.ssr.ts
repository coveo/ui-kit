import type {SearchEngine} from '@coveo/headless';
import {type BreadcrumbManager, buildBreadcrumbManager} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type Breadcrumb,
  type BreadcrumbValue,
  type CategoryFacetBreadcrumb,
  type CoreBreadcrumbManager,
  type CoreBreadcrumbManagerState,
  type DateFacetBreadcrumb,
  type DeselectableValue,
  type FacetBreadcrumb,
  type NumericFacetBreadcrumb,
  type StaticFilterBreadcrumb,
  type BreadcrumbManager,
  type BreadcrumbManagerState,
  type AutomaticFacetBreadcrumb,
} from '@coveo/headless';

export interface BreadcrumbManagerDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  BreadcrumbManager
> {}

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
