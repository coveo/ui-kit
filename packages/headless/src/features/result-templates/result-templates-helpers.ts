import {isNullOrUndefined} from '@coveo/bueno';
import {Product} from '../../api/commerce/common/product';
import {Result} from '../../api/search/search/result';
import {isArray} from '../../utils/utils';
import {ResultTemplateCondition} from './result-templates-manager';

/**
 * Extracts a property from a result object.
 * @param result (Result) The target result.
 * @param property (string) The property to extract.
 * @returns (unknown) The value of the specified property in the specified result, or null if the property does not exist.
 */
export const getResultProperty = (result: Result, property: string) => {
  // TODO: no no
  console.log('YOP');
  const anyProduct = result as unknown as Record<string, unknown>;
  if (!isNullOrUndefined(anyProduct[property])) {
    return anyProduct[property];
  }

  return null;
};

/**
 * Extracts a property from a result object.
 * @param result (Product) The target result.
 * @param property (string) The property to extract.
 * @returns (unknown) The value of the specified property in the specified result, or null if the property does not exist.
 * @internal
 */
export const getProductProperty = (product: Product, property: string) => {
  const anyProduct = product as unknown as Record<string, unknown>;
  if (!isNullOrUndefined(anyProduct[property])) {
    return anyProduct[property];
  }

  return null;
};

/**
 * Creates a condition that verifies if the specified fields are defined.
 * @param fieldNames (string[]) A list of fields that must be defined.
 * @returns (ResultTemplateCondition) A function that takes a result and checks if every field in the specified list is defined.
 */
export const fieldsMustBeDefined = (
  fieldNames: string[]
): ResultTemplateCondition => {
  return (result: Result) => {
    return fieldNames.every(
      (fieldName) => !isNullOrUndefined(getResultProperty(result, fieldName))
    );
  };
};

/**
 * Creates a condition that verifies if the specified fields are not defined.
 * @param fieldNames (string[]) A list of fields that must not be defined.
 * @returns (ResultTemplateCondition) A function that takes a result and checks if every field in the specified list is not defined.
 */
export const fieldsMustNotBeDefined = (
  fieldNames: string[]
): ResultTemplateCondition => {
  return (result: Result) => {
    return fieldNames.every((fieldName) =>
      isNullOrUndefined(getResultProperty(result, fieldName))
    );
  };
};

/**
 * Creates a condition that verifies if a field's value contains any of the specified values.
 * @param fieldName (string) The name of the field to check.
 * @param valuesToMatch (string[]) A list of possible values to match.
 * @returns (ResultTemplateCondition) A function that takes a result and checks if the value for the specified field matches any value in the specified list.
 */
export const fieldMustMatch = (
  fieldName: string,
  valuesToMatch: string[]
): ResultTemplateCondition => {
  return (result: Result) => {
    const fieldValues = getFieldValuesFromResult(fieldName, result);
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
 * @returns (ResultTemplateCondition) A function that takes a result and checks that the value for the specified field does not match any value in the given list.
 */
export const fieldMustNotMatch = (
  fieldName: string,
  blacklistedValues: string[]
): ResultTemplateCondition => {
  return (result: Result) => {
    const fieldValues = getFieldValuesFromResult(fieldName, result);
    return blacklistedValues.every((blacklistedValue) =>
      fieldValues.every(
        (fieldValue) =>
          `${fieldValue}`.toLowerCase() !== blacklistedValue.toLowerCase()
      )
    );
  };
};

const getFieldValuesFromResult = (fieldName: string, result: Result) => {
  const rawValue = getResultProperty(result, fieldName);
  return isArray(rawValue) ? rawValue : [rawValue];
};

export const ResultTemplatesHelpers = {
  getResultProperty,
  fieldsMustBeDefined,
  fieldsMustNotBeDefined,
  fieldMustMatch,
  fieldMustNotMatch,
};
