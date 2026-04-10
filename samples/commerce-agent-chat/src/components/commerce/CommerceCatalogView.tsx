import type {Product} from '../../types/commerce.js';
import type {A2UISurfaceContent} from '../../types/commerce.js';
import {
  extractActionsBySurface,
  extractCatalogComponents,
  extractProductsBySurface,
} from '../../lib/commerceExtractor.js';
import {BundleDisplay} from './BundleDisplay.js';
import {ComparisonSummary} from './ComparisonSummary.js';
import {ComparisonTable} from './ComparisonTable.js';
import {NextActionsBar} from './NextActionsBar.js';
import {ProductCarousel, type ProductSection} from './ProductCarousel.js';

function normalizeType(type: string): string {
  return type.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function isType(type: string, expected: string): boolean {
  const normalized = normalizeType(type);
  if (normalized === normalizeType(expected)) {
    return true;
  }
  return normalized.includes(normalizeType(expected));
}

function isSupportedType(type: string): boolean {
  return (
    isType(type, 'ProductCarousel') ||
    isType(type, 'ComparisonTable') ||
    isType(type, 'ComparisonSummary') ||
    isType(type, 'BundleDisplay') ||
    isType(type, 'NextActionsBar')
  );
}

// Module-level cache so bundle slot products persist across delta patches,
// matching the same pattern used in the dashboard renderer.
const bundleProductCache = new Map<string, Product[]>();

export function resetCommerceCatalogCache(): void {
  bundleProductCache.clear();
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

  for (const [surfaceId, products] of productsBySurface.entries()) {
    if (surfaceId.startsWith('bundle-surface-') && products.length > 0) {
      bundleProductCache.set(surfaceId, products);
    }
  }

  const getProducts = (surfaceId: string): Product[] =>
    productsBySurface.get(surfaceId) ?? bundleProductCache.get(surfaceId) ?? [];

  const catalogComponents = extractCatalogComponents(operations);
  const actionsBySurface = extractActionsBySurface(operations);
  const supported = catalogComponents.filter((c) => isSupportedType(c.type));
  const hasNextActionsComponent = supported.some((component) =>
    isType(component.type, 'NextActionsBar')
  );

  const allProducts = Array.from(productsBySurface.values())
    .flat()
    .filter((product, index, arr) => {
      const key =
        product.ec_product_id ||
        `${product.ec_name ?? ''}-${product.ec_price ?? ''}`;
      return (
        arr.findIndex((candidate) => {
          const candidateKey =
            candidate.ec_product_id ||
            `${candidate.ec_name ?? ''}-${candidate.ec_price ?? ''}`;
          return candidateKey === key;
        }) === index
      );
    });

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
