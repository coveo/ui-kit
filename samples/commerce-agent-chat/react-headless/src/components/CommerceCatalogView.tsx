import {useEffect, useMemo, useRef} from 'react';
import {
  extractActionsBySurface,
  extractCatalogComponents,
  extractProductsBySurface,
} from '../../../core/src/lib/commerceExtractor.js';
import {
  isSupportedType,
  normalizeType,
  isType,
  uniqueProducts,
} from '../../../core/src/lib/commerceHelpers.js';
import type {
  A2UISurfaceContent,
  BundleTierConfig,
  CatalogComponent,
  NextAction,
  Product,
} from '../../../core/src/types/commerce.js';

import './CommerceCatalogView.css';

interface ProductSection {
  heading: string;
  products: Product[];
}

interface BundleSlotWithProduct {
  categoryLabel: string;
  surfaceRef: string;
  product: Product | null;
}

interface BundleTierWithProducts extends Omit<BundleTierConfig, 'slots'> {
  slots: BundleSlotWithProduct[];
}

interface CommerceCatalogViewProps {
  content: A2UISurfaceContent;
  isLoading: boolean;
  bundleProducts: Map<string, Product[]>;
  allowNextActionsFallback: boolean;
}

interface ProductCarouselElement extends HTMLElement {
  sections: ProductSection[];
  isLoading: boolean;
}

interface ComparisonTableElement extends HTMLElement {
  heading: string;
  products: Product[];
  comparisonAttributes: string[];
  isLoading: boolean;
}

interface ComparisonSummaryElement extends HTMLElement {
  text: string;
}

interface BundleDisplayElement extends HTMLElement {
  heading: string;
  bundles: BundleTierWithProducts[];
  isLoading: boolean;
}

interface NextActionsBarElement extends HTMLElement {
  actions: NextAction[];
  isLoading: boolean;
}

function ProductCarouselBridge({
  sections,
  isLoading,
}: {
  sections: ProductSection[];
  isLoading: boolean;
}): React.JSX.Element {
  const ref = useRef<ProductCarouselElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.sections = sections;
    ref.current.isLoading = isLoading;
  }, [sections, isLoading]);

  return <cac-product-carousel ref={ref} />;
}

function ComparisonTableBridge({
  heading,
  products,
  comparisonAttributes,
  isLoading,
}: {
  heading: string;
  products: Product[];
  comparisonAttributes: string[];
  isLoading: boolean;
}): React.JSX.Element {
  const ref = useRef<ComparisonTableElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.heading = heading;
    ref.current.products = products;
    ref.current.comparisonAttributes = comparisonAttributes;
    ref.current.isLoading = isLoading;
  }, [heading, products, comparisonAttributes, isLoading]);

  return <cac-comparison-table ref={ref} />;
}

function ComparisonSummaryBridge({text}: {text: string}): React.JSX.Element {
  const ref = useRef<ComparisonSummaryElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.text = text;
  }, [text]);

  return <cac-comparison-summary ref={ref} />;
}

function BundleDisplayBridge({
  heading,
  bundles,
  isLoading,
}: {
  heading: string;
  bundles: BundleTierWithProducts[];
  isLoading: boolean;
}): React.JSX.Element {
  const ref = useRef<BundleDisplayElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.heading = heading;
    ref.current.bundles = bundles;
    ref.current.isLoading = isLoading;
  }, [heading, bundles, isLoading]);

  return <cac-bundle-display ref={ref} />;
}

function NextActionsBarBridge({
  actions,
  isLoading,
}: {
  actions: NextAction[];
  isLoading: boolean;
}): React.JSX.Element {
  const ref = useRef<NextActionsBarElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.actions = actions;
    ref.current.isLoading = isLoading;
  }, [actions, isLoading]);

  return <cac-next-actions-bar ref={ref} />;
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
  content,
  isLoading,
  bundleProducts,
  allowNextActionsFallback,
}: CommerceCatalogViewProps): React.JSX.Element | null {
  const operations = content?.operations ?? [];

  const {
    supportedComponents,
    actionsBySurface,
    allProducts,
    hasNextActionsComponent,
    getProducts,
  } = useMemo(() => {
    const productsBySurface = extractProductsBySurface(operations);
    const catalogComponents = extractCatalogComponents(operations);
    const nextSupportedComponents =
      getLatestSupportedComponents(catalogComponents);

    return {
      supportedComponents: nextSupportedComponents,
      actionsBySurface: extractActionsBySurface(operations),
      allProducts: uniqueProducts(productsBySurface),
      hasNextActionsComponent: nextSupportedComponents.some((component) =>
        isType(component.type, 'NextActionsBar')
      ),
      getProducts: (surfaceId: string) =>
        productsBySurface.get(surfaceId) ?? bundleProducts.get(surfaceId) ?? [],
    };
  }, [operations, bundleProducts]);

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
            <ProductCarouselBridge
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
            <ComparisonTableBridge
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
            <ComparisonSummaryBridge
              key={`comparison-summary-${index}`}
              text={component.text ?? ''}
            />
          );
        }

        if (isType(component.type, 'BundleDisplay')) {
          const bundles = getBundleTiersWithProducts(component, getProducts);
          const inferredLoading = isLoading && !hasBundleSlotProduct(bundles);

          return (
            <BundleDisplayBridge
              key={`bundle-display-${index}`}
              heading={component.title ?? component.heading}
              bundles={bundles}
              isLoading={Boolean(component.isLoading) || inferredLoading}
            />
          );
        }

        if (isType(component.type, 'NextActionsBar')) {
          const actions = actionsBySurface.get(component.surfaceId) ?? [];
          const inferredLoading = isLoading && actions.length === 0;

          return (
            <NextActionsBarBridge
              key={`next-actions-${index}`}
              actions={actions}
              isLoading={Boolean(component.isLoading) || inferredLoading}
            />
          );
        }

        return null;
      })}
      {shouldRenderFallback && (
        <NextActionsBarBridge actions={[]} isLoading={true} />
      )}
    </div>
  );
}
