import {isArray, isNullOrUndefined} from '@coveo/bueno';
import {Product} from '../../../api/commerce/common/product';
import {ProductTemplateCondition} from './product-templates-manager';

/**
 * Extracts a property from a product object.
 * @param product (Product) - The target product.
 * @param property (string) - The property to extract.
 * @returns (unknown) The value of the specified property in the specified product, or null if the property does not exist.
 */
export const getProductProperty = (product: Product, property: string) => {
  const anyProduct = product as unknown as Record<string, unknown>;

  if (!isNullOrUndefined(anyProduct[property])) {
    return anyProduct[property];
  }

  if (!isNullOrUndefined(product.additionalFields[property])) {
    return product.additionalFields[property];
  }

  return null;
};

/**
 * Creates a condition that verifies if the specified fields are defined.
 * @param fieldNames (string[]) - A list of fields that must be defined.
 * @returns (ProductTemplateCondition) A function that takes a product and checks if every field in the specified list is defined.
 */
export const fieldsMustBeDefined = (
  fieldNames: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    return fieldNames.every(
      (fieldName) => !isNullOrUndefined(getProductProperty(product, fieldName))
    );
  };
};

/**
 * Creates a condition that verifies if the specified fields are not defined.
 * @param fieldNames (string[]) - A list of fields that must not be defined.
 * @returns (ProductTemplateCondition) A function that takes a product and checks if every field in the specified list is not defined.
 */
export const fieldsMustNotBeDefined = (
  fieldNames: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    return fieldNames.every((fieldName) =>
      isNullOrUndefined(getProductProperty(product, fieldName))
    );
  };
};

/**
 * Creates a condition that verifies whether the value of a field is equal to any of the specified values (casing insensitive).
 * @param fieldName (string) - The name of the field to evaluate the condition against.
 * @param allowedValues (string[]) - The list of values that the field value can be equal to in order for the condition to evaluate to "true" (case insensitive).
 * @returns (ProductTemplateCondition) - A function that takes a Product as an argument and returns "true" if the value for the specified field is equal to any of the values in the specified list (case insensitive), and "false" otherwise.
 */
export const fieldMustMatch = (
  fieldName: string,
  valuesToMatch: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    const fieldValues = getFieldValuesFromProduct(fieldName, product);
    return valuesToMatch.some((valueToMatch) =>
      fieldValues.some(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() === valueToMatch.toLowerCase()
      )
    );
  };
};

/**
 * Creates a condition that verifies whether the value of a field is not equal to any of the specified values (case insensitive).
 * @param fieldName (string) - The name of the field to evaluate the condition against.
 * @param disallowedValues (string[]) - The list of values that the field value must not be equal to in order for the condition to evaluate to "true" (case insensitive).
 * @returns (ProductTemplateCondition) A function that takes a Product as an argument and returns "true" if the value for the specified field is not equal to any of the values in the given list (case insensitive), or "false" otherwise.
 */
export const fieldMustNotMatch = (
  fieldName: string,
  disallowedValues: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    const fieldValues = getFieldValuesFromProduct(fieldName, product);
    return disallowedValues.every((disallowedValues) =>
      fieldValues.every(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() !== disallowedValues.toLowerCase()
      )
    );
  };
};

const getFieldValuesFromProduct = (fieldName: string, product: Product) => {
  const rawValue = getProductProperty(product, fieldName);
  return isArray(rawValue) ? rawValue : [rawValue];
};

export const ProductTemplatesHelpers = {
  getProductProperty,
  fieldsMustBeDefined,
  fieldsMustNotBeDefined,
  fieldMustMatch,
  fieldMustNotMatch,
};
