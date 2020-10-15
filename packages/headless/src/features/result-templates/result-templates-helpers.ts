import {ResultTemplateCondition} from './result-templates';
import {isArray} from '../../utils/utils';
import {Result} from '../../api/search/search/result';

/**
 * Extracts a property from a result object.
 * @param result (Result) The target result.
 * @param property (string) The property to extract.
 * @returns (unknown) The value of the specified property in the specified result, or null if the property does not exist.
 */
export const getResultProperty = (result: Result, property: string) => {
  if (property in result) {
    return (result as Record<string, unknown>)[property];
  }

  if (property in result.raw) {
    return result.raw[property];
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
    return fieldNames.every((fieldName) => result.raw[fieldName] !== undefined);
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
  const rawValue = result.raw[fieldName];
  return isArray(rawValue) ? rawValue : [rawValue];
};
