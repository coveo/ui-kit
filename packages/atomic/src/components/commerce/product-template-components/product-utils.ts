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
    if (!newValue) {
      newValue = readFromObject(window, key);
    }

    if (!newValue) {
      bindings.engine.logger.warn(
        `${key} used in the href template is undefined for this product: ${product.permanentid}`
      );
      return '';
    }

    return newValue;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readFromObject(object: any, key: string): string {
  const firstPeriodIndex = key.indexOf('.');
  if (object && firstPeriodIndex !== -1) {
    const newKey = key.substring(firstPeriodIndex + 1);
    key = key.substring(0, firstPeriodIndex);
    return readFromObject(object[key], newKey);
  }
  return object ? object[key] : undefined;
}
