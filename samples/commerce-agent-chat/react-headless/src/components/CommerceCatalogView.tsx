import {useMemo} from 'react';
import type {
  AgentChatCatalogActivityState,
  AgentChatProduct,
} from '@coveo/headless/commerce';
import {
  isSupportedType,
  normalizeType,
  isType,
} from '../lib/commerceHelpers.js';
import type {CatalogComponent, Product} from '../types/commerce.js';
import {ComparisonTable} from './ComparisonTable.js';
import {ComparisonSummary} from './ComparisonSummary.js';
import {BundleDisplay} from './BundleDisplay.js';
import type {BundleTierWithProducts} from './BundleDisplay.js';
import {NextActionsBar} from './NextActionsBar.js';
import {ProductCarousel} from './ProductCarousel.js';

import './CommerceCatalogView.css';

interface ProductSection {
  heading: string;
  products: Product[];
}

interface CommerceCatalogViewProps {
  catalog: AgentChatCatalogActivityState | null;
  isLoading: boolean;
  bundleProducts: Record<string, AgentChatProduct[]>;
  allowNextActionsFallback: boolean;
}

function getLatestSupportedComponents(components: CatalogComponent[]) {
  const latestByTypeAndSurface = new Map<string, CatalogComponent>();

  for (const component of components) {
    if (!isSupportedType(component.type)) {
      continue;
    }

    const normalized = normalizeType(component.type);
    const key = isType(component.type, 'NextActionsBar')
      ? normalized
      : `${normalized}::${component.surfaceId}`;

    latestByTypeAndSurface.delete(key);
    latestByTypeAndSurface.set(key, component);
  }

  return Array.from(latestByTypeAndSurface.values());
}

function getBundleTiersWithProducts(
  component: CatalogComponent,
  getProducts: (surfaceId: string) => Product[]
) {
  return (component.bundles ?? []).map((bundle) => ({
    ...bundle,
    slots: bundle.slots.map((slot) => {
      const surfaceRef = slot.surfaceRef.trim();
      return {
        ...slot,
        surfaceRef,
        product: getProducts(surfaceRef)[0] ?? null,
      };
    }),
  })) as BundleTierWithProducts[];
}

function hasBundleSlotProduct(bundles: BundleTierWithProducts[]) {
  return bundles.some((bundle) =>
    bundle.slots.some((slot) => slot.product !== null)
  );
}

export function CommerceCatalogView({
  catalog,
  isLoading,
  bundleProducts,
  allowNextActionsFallback,
}: CommerceCatalogViewProps): React.JSX.Element | null {
  const {
    supportedComponents,
    actionsBySurface,
    allProducts,
    hasNextActionsComponent,
    getProducts,
  } = useMemo(() => {
    const productsBySurface = catalog?.productsBySurface ?? {};
    const catalogComponents = catalog?.catalogComponents ?? [];
    const nextSupportedComponents =
      getLatestSupportedComponents(catalogComponents);

    return {
      supportedComponents: nextSupportedComponents,
      actionsBySurface: catalog?.actionsBySurface ?? {},
      allProducts: catalog?.allProducts ?? [],
      hasNextActionsComponent: Boolean(catalog?.hasNextActionsComponent),
      getProducts: (surfaceId: string) =>
        productsBySurface[surfaceId] ?? bundleProducts[surfaceId] ?? [],
    };
  }, [catalog, bundleProducts]);

  const shouldRenderFallback =
    allowNextActionsFallback && isLoading && !hasNextActionsComponent;

  if (supportedComponents.length === 0 && !shouldRenderFallback) {
    return null;
  }

  return (
    <div className="rh-commerce-catalog">
      {supportedComponents.map((component, index) => {
        if (isType(component.type, 'ProductCarousel')) {
          const products = getProducts(component.surfaceId);
          const sections: ProductSection[] = [
            {heading: component.heading, products},
          ];
          const inferredLoading = isLoading && products.length === 0;

          return (
            <ProductCarousel
              key={`product-carousel-${index}`}
              sections={sections}
              isLoading={Boolean(component.isLoading) || inferredLoading}
            />
          );
        }

        if (isType(component.type, 'ComparisonTable')) {
          const products = getProducts(component.surfaceId);
          const comparisonProducts =
            products.length > 0 ? products : allProducts;
          const inferredLoading = isLoading && comparisonProducts.length === 0;

          return (
            <ComparisonTable
              key={`comparison-table-${index}`}
              heading={component.heading}
              products={comparisonProducts}
              comparisonAttributes={component.attributes ?? []}
              isLoading={Boolean(component.isLoading) || inferredLoading}
            />
          );
        }

        if (isType(component.type, 'ComparisonSummary')) {
          return (
            <ComparisonSummary
              key={`comparison-summary-${index}`}
              text={component.text ?? ''}
            />
          );
        }

        if (isType(component.type, 'BundleDisplay')) {
          const bundles = getBundleTiersWithProducts(component, getProducts);
          const inferredLoading = isLoading && !hasBundleSlotProduct(bundles);

          return (
            <BundleDisplay
              key={`bundle-display-${index}`}
              heading={component.title ?? component.heading}
              bundles={bundles}
              isLoading={Boolean(component.isLoading) || inferredLoading}
            />
          );
        }

        if (isType(component.type, 'NextActionsBar')) {
          const actions = actionsBySurface[component.surfaceId] ?? [];
          const inferredLoading = isLoading && actions.length === 0;

          return (
            <NextActionsBar
              key={`next-actions-${index}`}
              actions={actions}
              isLoading={Boolean(component.isLoading) || inferredLoading}
            />
          );
        }

        return null;
      })}
      {shouldRenderFallback && <NextActionsBar actions={[]} isLoading={true} />}
    </div>
  );
}
