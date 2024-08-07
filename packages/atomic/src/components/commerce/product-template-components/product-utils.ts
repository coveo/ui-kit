import {Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

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

export function buildStringTemplateFromProduct(
  template: string,
  product: Product,
  bindings: CommerceBindings
) {
  return template.replace(/\${(.*?)}/g, (value: string) => {
    const key = value.substring(2, value.length - 1);
    let newValue = readFromObject(product, key);
    if (!newValue && typeof window !== 'undefined') {
      newValue = readFromObject(window, key);
    }

    if (!newValue) {
      bindings.engine.logger.warn(
        `${key} used in the href template is undefined for this product: ${product.permanentid} and not found in the window object.`
      );
      return '';
    }

    return newValue;
  });
}

function readFromObject<T>(object: T, key: string): string | undefined {
  if (object && typeof object === 'object' && key in object) {
    const value = (object as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}
