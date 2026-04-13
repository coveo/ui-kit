import type {Product} from '@core/types/commerce.js';
import type {A2UISurfaceContent} from '@core/types/commerce.js';
import {
  extractActionsBySurface,
  extractCatalogComponents,
  extractProductsBySurface,
} from '@core/lib/commerceExtractor.js';
import {
  isSupportedType,
  isType,
  uniqueProducts,
} from '@core/lib/commerceHelpers.js';
import {
  getBundleProductsFromCache,
  resetBundleProductCache,
  updateBundleProductCache,
} from '@core/lib/bundleProductCache.js';
import {BundleDisplay} from './BundleDisplay.js';
import {ComparisonSummary} from './ComparisonSummary.js';
import {ComparisonTable} from './ComparisonTable.js';
import {NextActionsBar} from './NextActionsBar.js';
import {ProductCarousel, type ProductSection} from './ProductCarousel.js';

export function resetCommerceCatalogCache(): void {
  resetBundleProductCache();
}

function hasBundleSlotProduct(
  bundles: Array<{slots: Array<{product: Product | null}>}>
): boolean {
  return bundles.some((bundle) =>
    bundle.slots.some((slot) => slot.product !== null)
  );
}

export function CommerceCatalogView({
  content,
  isLoading = false,
  onActionSelected,
}: {
  content: A2UISurfaceContent;
  isLoading?: boolean;
  onActionSelected?: (prompt: string) => void;
}) {
  const {operations} = content;
  const productsBySurface = extractProductsBySurface(operations);

  updateBundleProductCache(productsBySurface);

  const getProducts = (surfaceId: string): Product[] =>
    productsBySurface.get(surfaceId) ?? getBundleProductsFromCache(surfaceId);

  const catalogComponents = extractCatalogComponents(operations);
  const actionsBySurface = extractActionsBySurface(operations);
  const supported = catalogComponents.filter((c) => isSupportedType(c.type));
  const hasNextActionsComponent = supported.some((component) =>
    isType(component.type, 'NextActionsBar')
  );

  const allProducts = uniqueProducts(productsBySurface);

  if (supported.length === 0) return null;

  return (
    <div className="commerce-catalog">
      {supported.map((comp, i) => {
        if (isType(comp.type, 'ProductCarousel')) {
          const products = getProducts(comp.surfaceId);
          const sections: ProductSection[] = [
            {heading: comp.heading, products},
          ];
          const inferredLoading = isLoading && products.length === 0;
          return (
            <ProductCarousel
              key={`product-carousel-${i}`}
              sections={sections}
              isLoading={(comp.isLoading ?? false) || inferredLoading}
            />
          );
        }

        if (isType(comp.type, 'ComparisonTable')) {
          const products = getProducts(comp.surfaceId);
          const comparisonProducts =
            products.length > 0 ? products : allProducts;
          const inferredLoading = isLoading && comparisonProducts.length === 0;
          return (
            <ComparisonTable
              key={`comparison-table-${i}`}
              heading={comp.heading}
              products={comparisonProducts}
              attributes={comp.attributes ?? []}
              isLoading={(comp.isLoading ?? false) || inferredLoading}
            />
          );
        }

        if (isType(comp.type, 'ComparisonSummary')) {
          return (
            <ComparisonSummary
              key={`comparison-summary-${i}`}
              text={comp.text ?? ''}
            />
          );
        }

        if (isType(comp.type, 'BundleDisplay')) {
          const bundles = (comp.bundles ?? []).map((bundle) => ({
            ...bundle,
            slots: bundle.slots.map((slot) => ({
              ...slot,
              surfaceRef: slot.surfaceRef.trim(),
              product: getProducts(slot.surfaceRef.trim())[0] ?? null,
            })),
          }));
          const inferredLoading = isLoading && !hasBundleSlotProduct(bundles);
          return (
            <BundleDisplay
              key={`bundle-display-${i}`}
              title={comp.title ?? comp.heading}
              bundles={bundles}
              isLoading={(comp.isLoading ?? false) || inferredLoading}
            />
          );
        }

        if (isType(comp.type, 'NextActionsBar')) {
          const actions = actionsBySurface.get(comp.surfaceId) ?? [];
          const inferredLoading = isLoading && actions.length === 0;
          return (
            <NextActionsBar
              key={`next-actions-${i}`}
              actions={actions}
              isLoading={(comp.isLoading ?? false) || inferredLoading}
              onActionClick={onActionSelected}
            />
          );
        }

        return null;
      })}
      {isLoading && !hasNextActionsComponent ? (
        <NextActionsBar actions={[]} isLoading={true} />
      ) : null}
    </div>
  );
}
