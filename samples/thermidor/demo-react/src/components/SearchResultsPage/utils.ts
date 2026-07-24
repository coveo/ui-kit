export interface Product {
  ec_thumbnails?: string[];
  ec_images?: string[];
  [key: string]: unknown;
}

export function resolveProductImage(product: Product): string | null {
  if (product.ec_thumbnails?.length) return product.ec_thumbnails[0];
  if (product.ec_images?.length) return product.ec_images[0];
  return null;
}

export function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen) + '\u2026' : text;
}
