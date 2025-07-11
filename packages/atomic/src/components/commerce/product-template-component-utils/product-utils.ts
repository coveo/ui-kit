import {type Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {readFromObject} from '@/src/utils/object-utils';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {FieldValueIsNaNError} from './error';

export function parseValue(product: Product, field: string) {
  const value = ProductTemplatesHelpers.getProductProperty(product, field);
  if (value === null) {
    return null;
  }
  const valueAsNumber = parseFloat(`${value}`);
  if (Number.isNaN(valueAsNumber)) {
    throw new FieldValueIsNaNError(field, value);
  }
  return valueAsNumber;
}

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
        `${key} used in the href template is undefined for this product: ${product.permanentid} and could not be found in the window object.`
      );
      return '';
    }

    return newValue;
  });
}
