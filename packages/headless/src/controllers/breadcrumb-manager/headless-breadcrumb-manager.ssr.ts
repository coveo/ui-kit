import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  BreadcrumbManager,
  buildBreadcrumbManager,
} from './headless-breadcrumb-manager';

export type {
  NumericFacetBreadcrumb,
  FacetBreadcrumb,
  DateFacetBreadcrumb,
  CategoryFacetBreadcrumb,
  StaticFilterBreadcrumb,
  Breadcrumb,
  BreadcrumbValue,
  BreadcrumbManagerState,
  BreadcrumbManager,
  DeselectableValue,
  AutomaticFacetBreadcrumb,
  CoreBreadcrumbManager,
  CoreBreadcrumbManagerState,
} from './headless-breadcrumb-manager';

/**
 * @internal
 */
export const defineBreadcrumbManager = (): ControllerDefinitionWithoutProps<
  SearchEngine,
  BreadcrumbManager
> => ({
  build: (engine) => buildBreadcrumbManager(engine),
});
