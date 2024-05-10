import {Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';

export function getStringValueFromProductOrNull(
  product: Product,
  field: string
) {
  const value = ProductTemplatesHelpers.getProductProperty(product, field);

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return value;
}
