import {isArray, isNullOrUndefined} from '@coveo/bueno';
import {Product} from '../../../api/commerce/common/product';
import {ProductTemplateCondition} from './product-templates-manager';

/**
 * Extracts a property from a product object.
 * @param product (Product) The target product.
 * @param property (string) The property to extract.
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
 * @param fieldNames (string[]) A list of fields that must be defined.
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
 * @param fieldNames (string[]) A list of fields that must not be defined.
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
 * Creates a condition that verifies if a field's value contains any of the specified values.
 * @param fieldName (string) The name of the field to check.
 * @param valuesToMatch (string[]) A list of possible values to match.
 * @returns (ProductTemplateCondition) A function that takes a product and checks if the value for the specified field matches any value in the specified list.
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
 * Creates a condition that verifies that a field's value does not contain any of the specified values.
 * @param fieldName (string) The name of the field to check.
 * @param blacklistedValues (string[]) A list of all disallowed values.
 * @returns (ProductTemplateCondition) A function that takes a product and checks that the value for the specified field does not match any value in the given list.
 */
export const fieldMustNotMatch = (
  fieldName: string,
  blacklistedValues: string[]
): ProductTemplateCondition => {
  return (product: Product) => {
    const fieldValues = getFieldValuesFromProduct(fieldName, product);
    return blacklistedValues.every((blacklistedValue) =>
      fieldValues.every(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() !== blacklistedValue.toLowerCase()
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
