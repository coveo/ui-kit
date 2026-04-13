import type {Product} from '../types/commerce.js';

export function formatPrice(value: unknown): string {
  if (typeof value !== 'number') {
    return '';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatAttribute(attribute: string): string {
  return attribute
    .replace(/^ec_/, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function promoPrice(product: Product): number | null {
  const value = product.ec_promo_price;
  return typeof value === 'number' ? value : null;
}

export function hasDiscount(product: Product): boolean {
  const discount = promoPrice(product);
  return discount != null && discount < product.ec_price;
}

export function normalizeType(type: string): string {
  return type.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function isType(type: string, expected: string): boolean {
  const normalized = normalizeType(type);
  const normalizedExpected = normalizeType(expected);
  return (
    normalized === normalizedExpected || normalized.includes(normalizedExpected)
  );
}

export function isSupportedType(type: string): boolean {
  return (
    isType(type, 'ProductCarousel') ||
    isType(type, 'ComparisonTable') ||
    isType(type, 'ComparisonSummary') ||
    isType(type, 'BundleDisplay') ||
    isType(type, 'NextActionsBar')
  );
}

export function uniqueProducts(
  productsBySurface: Map<string, Product[]>
): Product[] {
  return Array.from(productsBySurface.values())
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
}
