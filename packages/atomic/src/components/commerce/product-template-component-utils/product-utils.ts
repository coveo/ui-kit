import {
  type Product,
  ProductTemplatesHelpers,
  ResultType,
  type SpotlightContent,
  SpotlightContentTemplatesHelpers,
} from '@coveo/headless/commerce';
import {readFromObject} from '@/src/utils/object-utils';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import {FieldValueIsNaNError} from './error';

export type CommerceResult = Product | SpotlightContent;

export function isSpotlightContent(result: CommerceResult): result is SpotlightContent {
  return result.resultType === ResultType.SPOTLIGHT;
}

/**
 * Reads a field from a product (including its `additionalFields`) or from a Spotlight Content item.
 */
export function getResultProperty(result: CommerceResult, field: string) {
  return isSpotlightContent(result)
    ? SpotlightContentTemplatesHelpers.getSpotlightContentProperty(result, field)
    : ProductTemplatesHelpers.getProductProperty(result, field);
}

export function parseValue(product: CommerceResult, field: string) {
  const value = getResultProperty(product, field);
  if (value === null) {
    return null;
  }
  const valueAsNumber = parseFloat(`${value}`);
  if (Number.isNaN(valueAsNumber)) {
    throw new FieldValueIsNaNError(field, value);
  }
  return valueAsNumber;
}

export function getStringValueFromProductOrNull(product: CommerceResult, field: string) {
  const value = getResultProperty(product, field);

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return value;
}

export function buildStringTemplateFromProduct(
  template: string,
  product: CommerceResult,
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
        `${key} used in the href template is undefined for this product: ${isSpotlightContent(product) ? product.id : product.permanentid} and could not be found in the window object.`
      );
      return '';
    }

    return newValue;
  });
}
