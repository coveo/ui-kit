import {Type} from '@angular/core';
import {
  AngularCatalog,
  AngularComponentImplementation,
} from '@a2ui/angular/v0_9';
import {BundleDisplayComponent} from '../components/bundle-display.component';
import {ComparisonSummaryComponent} from '../components/comparison-summary.component';
import {ComparisonTableComponent} from '../components/comparison-table.component';
import {NextActionsBarComponent} from '../components/next-actions-bar.component';
import {ProductCarouselComponent} from '../components/product-carousel.component';

function entry(
  name: string,
  component: Type<unknown>
): AngularComponentImplementation {
  return {
    name,
    schema: {} as AngularComponentImplementation['schema'],
    component: component as AngularComponentImplementation['component'],
  };
}

export const CUSTOM_CATALOG = new AngularCatalog('commerce', [
  entry('ProductCarousel', ProductCarouselComponent),
  entry('ComparisonTable', ComparisonTableComponent),
  entry('ComparisonSummary', ComparisonSummaryComponent),
  entry('BundleDisplay', BundleDisplayComponent),
  entry('NextActionsBar', NextActionsBarComponent),
]);
