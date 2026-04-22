/**
 * Sample-specific commerce helpers for react-headless.
 * Includes formatting utilities (locale/currency specific) and component type checking.
 */

/**
 * Format a price value using USD locale and currency.
 * Returns empty string for non-numeric values.
 */
export function formatPrice(value: unknown): string {
  if (typeof value !== 'number') {
    return '';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

/**
 * Format a product attribute name by removing ec_ prefix and humanizing.
 * Example: 'ec_brand' → 'Brand'
 */
export function formatAttribute(attribute: string): string {
  return attribute
    .replace(/^ec_/, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Extract the promotional price from a product, or null if not available.
 */
export function promoPrice(product: Product): number | null {
  const value = product.ec_promo_price;
  return typeof value === 'number' ? value : null;
}

/**
 * Check if a product has an active discount (promo price less than regular price).
 */
export function hasDiscount(product: Product): boolean {
  const discount = promoPrice(product);
  return discount != null && discount < product.ec_price;
}

/**
 * Normalize a component type string by removing non-alphanumeric characters and lowercasing.
 */
export function normalizeType(type: string): string {
  return type.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

/**
 * Check if a component type matches an expected type (case-insensitive, partial match allowed).
 */
export function isType(type: string, expected: string): boolean {
  const normalized = normalizeType(type);
  const normalizedExpected = normalizeType(expected);
  return (
    normalized === normalizedExpected || normalized.includes(normalizedExpected)
  );
}

/**
 * Check if a component type is supported by this sample implementation.
 * Other samples may support different component types.
 */
export function isSupportedType(type: string): boolean {
  return (
    isType(type, 'ProductCarousel') ||
    isType(type, 'ComparisonTable') ||
    isType(type, 'ComparisonSummary') ||
    isType(type, 'BundleDisplay') ||
    isType(type, 'NextActionsBar')
  );
}
