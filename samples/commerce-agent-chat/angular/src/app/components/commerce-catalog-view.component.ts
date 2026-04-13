import {CommonModule} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import {
  extractActionsBySurface,
  extractCatalogComponents,
  extractProductsBySurface,
} from '@core/lib/commerceExtractor.js';
import {
  isType,
  isSupportedType,
  uniqueProducts,
} from '@core/lib/commerceHelpers.js';
import {
  getBundleProductsFromCache,
  updateBundleProductCache,
} from '@core/lib/bundleProductCache.js';
import type {A2UISurfaceContent, Product} from '@core/types/commerce.js';

import {
  CommerceBundleDisplayComponent,
  type BundleTierWithProducts,
} from './commerce/commerce-bundle-display.component';
import {CommerceComparisonSummaryComponent} from './commerce/commerce-comparison-summary.component';
import {CommerceComparisonTableComponent} from './commerce/commerce-comparison-table.component';
import {CommerceNextActionsBarComponent} from './commerce/commerce-next-actions-bar.component';
import {
  CommerceProductCarouselComponent,
  type ProductSection,
} from './commerce/commerce-product-carousel.component';

@Component({
  selector: 'app-commerce-catalog-view',
  standalone: true,
  imports: [
    CommonModule,
    CommerceProductCarouselComponent,
    CommerceComparisonSummaryComponent,
    CommerceComparisonTableComponent,
    CommerceBundleDisplayComponent,
    CommerceNextActionsBarComponent,
  ],
  template: `
    <section class="commerce-catalog">
      @for (component of components; track $index) {
        @if (isType(component.type, 'ProductCarousel')) {
          <app-commerce-product-carousel
            [sections]="buildSections(component.heading, component.surfaceId)"
            [isLoading]="
              isLoading && getProducts(component.surfaceId).length === 0
            "
          />
        } @else if (isType(component.type, 'ComparisonSummary')) {
          <app-commerce-comparison-summary [text]="component.text ?? ''" />
        } @else if (isType(component.type, 'ComparisonTable')) {
          <app-commerce-comparison-table
            [heading]="component.heading ?? ''"
            [products]="comparisonProducts(component.surfaceId)"
            [attributes]="component.attributes ?? []"
            [isLoading]="
              isLoading && comparisonProducts(component.surfaceId).length === 0
            "
          />
        } @else if (isType(component.type, 'BundleDisplay')) {
          <app-commerce-bundle-display
            [title]="component.title ?? component.heading ?? ''"
            [bundles]="buildBundles(component)"
            [isLoading]="isLoading"
          />
        } @else if (isType(component.type, 'NextActionsBar')) {
          <app-commerce-next-actions-bar
            [actions]="actionsBySurface.get(component.surfaceId) ?? []"
            [isLoading]="
              isLoading &&
              (actionsBySurface.get(component.surfaceId)?.length ?? 0) === 0
            "
            (actionClick)="actionSelected.emit($event)"
          />
        }
      }

      @if (isLoading && !hasNextActionsComponent) {
        <app-commerce-next-actions-bar
          [actions]="[]"
          [isLoading]="true"
          (actionClick)="actionSelected.emit($event)"
        />
      }
    </section>
  `,
  styles: [
    `
      .commerce-catalog {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
    `,
  ],
})
export class CommerceCatalogViewComponent implements OnChanges {
  @Input({required: true}) content!: A2UISurfaceContent;
  @Input() isLoading = false;
  @Output() actionSelected = new EventEmitter<string>();

  protected readonly isType = isType;

  private productsBySurfaceModel = new Map<string, Product[]>();
  private actionsBySurfaceModel = new Map<
    string,
    Array<{type: string; text: string}>
  >();
  private componentsModel: Array<{
    type: string;
    surfaceId: string;
    heading?: string;
    text?: string;
    attributes?: string[];
    title?: string;
    isLoading?: boolean;
    bundles?: Array<{
      bundleId: string;
      label: string;
      description?: string;
      slots: Array<{surfaceRef: string; categoryLabel: string}>;
    }>;
  }> = [];
  private hasNextActionsComponentModel = false;
  private allProductsModel: Product[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      this.rebuildModel();
    }
  }

  private rebuildModel(): void {
    const operations = this.content?.operations ?? [];
    this.productsBySurfaceModel = extractProductsBySurface(operations);
    updateBundleProductCache(this.productsBySurfaceModel);

    this.actionsBySurfaceModel = extractActionsBySurface(operations);
    this.componentsModel = extractCatalogComponents(operations).filter(
      (component) => isSupportedType(component.type)
    );
    this.hasNextActionsComponentModel = this.componentsModel.some((component) =>
      isType(component.type, 'NextActionsBar')
    );

    this.allProductsModel = uniqueProducts(this.productsBySurfaceModel);
  }

  get productsBySurface() {
    return this.productsBySurfaceModel;
  }

  get actionsBySurface() {
    return this.actionsBySurfaceModel;
  }

  get components() {
    return this.componentsModel;
  }

  get hasNextActionsComponent() {
    return this.hasNextActionsComponentModel;
  }

  getProducts(surfaceId: string): Product[] {
    return (
      this.productsBySurfaceModel.get(surfaceId) ??
      getBundleProductsFromCache(surfaceId)
    );
  }

  uniqueProducts(): Product[] {
    return this.allProductsModel;
  }

  comparisonProducts(surfaceId: string): Product[] {
    const products = this.getProducts(surfaceId);
    return products.length ? products : this.uniqueProducts();
  }

  buildSections(
    heading: string | undefined,
    surfaceId: string
  ): ProductSection[] {
    return [{heading: heading ?? '', products: this.getProducts(surfaceId)}];
  }

  buildBundles(
    component: (typeof this.componentsModel)[number]
  ): BundleTierWithProducts[] {
    return (component.bundles ?? []).map((bundle) => ({
      ...bundle,
      slots: bundle.slots.map((slot) => ({
        ...slot,
        surfaceRef: slot.surfaceRef.trim(),
        product: this.getProducts(slot.surfaceRef.trim())[0] ?? null,
      })),
    }));
  }
}
